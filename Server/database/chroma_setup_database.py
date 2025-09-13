import os
import re
import asyncio
import textract
import chromadb
import subprocess
from InstructorEmbedding import INSTRUCTOR
from concurrent.futures import ThreadPoolExecutor
from difflib import SequenceMatcher
import shutil

# Initialize ChromaDB client
CHROMA_DB_PATH = "./data/chroma_db"
client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
collection = client.get_or_create_collection(
    name="documents",
    metadata={"hnsw:space": "cosine"}
)

def clear_collection_all(collection):
    """
    Remove all documents from the collection.
    ChromaDB does not support a 'delete all' directly, so we fetch all IDs and delete by IDs.
    """
    try:
        # First check if collection has any data
        count_result = collection.count()
        if count_result == 0:
            print("ℹ️ Collection is already empty, no data to clear")
            return

        print(f"ℹ️ Found {count_result} documents in collection, clearing...")

        # Fetch all document IDs in the collection using the correct API
        all_ids = []
        offset = 0
        batch_size = 1000
        while True:
            # Use the correct include parameter - just get all data and extract IDs
            results = collection.get(
                offset=offset,
                limit=batch_size
            )
            ids = results.get("ids", [])
            if not ids:
                break
            all_ids.extend(ids)
            if len(ids) < batch_size:
                break
            offset += batch_size

        if all_ids:
            collection.delete(ids=all_ids)
            print(f"✅ Successfully deleted {len(all_ids)} documents from collection")
        else:
            print("ℹ️ No documents found to delete")

    except Exception as e:
        print(f"⚠️ Failed to clear existing ChromaDB data: {e}")
        raise e  # Re-raise the exception so the calling function knows it failed

# Load InstructorEmbedding model once
instructor_model = INSTRUCTOR("hkunlp/instructor-base")

executor = ThreadPoolExecutor(max_workers=4)  # parallelism

def embed_sync(texts):
    """Generate embeddings synchronously"""
    instructions = [["Represent the document for retrieval:", t] for t in texts]
    return instructor_model.encode(instructions)

async def embed(texts):
    """Async wrapper for embeddings"""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, embed_sync, texts)

def load_file(file_path: str) -> str:
    """Extract text from file using textract"""
    try:
        print(f"      📖 Reading file: {os.path.basename(file_path)}")
        text = textract.process(file_path)
        decoded_text = text.decode("utf-8")
        print(f"      ✅ Successfully read {len(decoded_text)} characters from: {os.path.basename(file_path)}")
        return decoded_text
    except Exception as e:
        print(f"      ❌ Failed to read {os.path.basename(file_path)}: {e}")
        return ""

def chunk_text(text: str, chunk_size: int = 500) -> list[str]:
    """Split text into smaller chunks"""
    words = text.split()
    return [" ".join(words[i:i+chunk_size]) for i in range(0, len(words), chunk_size)]

def format_fallback_response(context_chunks: str, user_query: str) -> str:
    """Format the fallback response in a human-readable way when Ollama is not available"""
    if not context_chunks or context_chunks.strip() == "":
        return "I don't have any relevant information in the database to answer your question."
    
    # Clean up the context chunks
    cleaned_context = context_chunks.strip()
    
    # Remove duplicate lines and clean up the data
    lines = cleaned_context.split('\n')
    unique_lines = []
    seen = set()
    
    for line in lines:
        line = line.strip()
        if line and line not in seen and not line.startswith('Note:'):
            seen.add(line)
            unique_lines.append(line)
    
    if not unique_lines:
        return "I don't have any relevant information in the database to answer your question."
    
    # Remove repetitive patterns and clean up the data
    cleaned_lines = []
    for line in unique_lines:
        # Remove lines that are just numbers or very short
        if len(line.strip()) < 3 or line.strip().isdigit():
            continue
        # Remove lines that are just punctuation or special characters
        if not any(c.isalnum() for c in line):
            continue
        cleaned_lines.append(line)
    
    if not cleaned_lines:
        return "I found some data but it appears to be incomplete or unclear. Please try rephrasing your question."
    
    # Try to identify the type of data and format accordingly
    if any(keyword in user_query.lower() for keyword in ['table', 'data', 'list', 'show', 'display', 'employee', 'salary', 'name']):
        # For tabular data, try to format it better
        formatted_lines = []
        
        for line in cleaned_lines:
            # Try to detect if it's tabular data
            if any(char in line for char in ['\t', '  ', '|']) or any(word in line.upper() for word in ['NAME', 'EMPID', 'SALARY', 'ID', 'AMOUNT']):
                # Split by common delimiters and format
                parts = line.replace('\t', ' | ').replace('  ', ' | ').split('|')
                if len(parts) > 1:
                    formatted_lines.append(' | '.join(part.strip() for part in parts))
                else:
                    # Try to split by spaces for tabular data
                    words = line.split()
                    if len(words) >= 2:
                        formatted_lines.append(' | '.join(words))
                    else:
                        formatted_lines.append(line)
            else:
                formatted_lines.append(line)
        
        if formatted_lines:
            response = "Based on the available data, here's what I found:\n\n"
            response += '\n'.join(formatted_lines[:10])  # Limit to first 10 lines to avoid overwhelming output
            if len(formatted_lines) > 10:
                response += f"\n\n... and {len(formatted_lines) - 10} more entries"
        else:
            response = f"Based on the available context, here's what I found:\n\n{cleaned_context}"
    else:
        # For general queries, provide a cleaner response
        response = f"Based on the available context, here's what I found:\n\n{cleaned_context}"
    
    return response

def check_existing_data():
    """Check if there's existing data in the ChromaDB collection"""
    try:
        count = collection.count()
        return count > 0, count
    except Exception as e:
        print(f"⚠️ Error checking existing data: {e}")
        return False, 0

async def add_folder(folder_path: str):
    """Process all files in a folder asynchronously and add to ChromaDB, removing existing data and files first"""
    global client, collection

    if not os.path.exists(folder_path):
        raise FileNotFoundError(f"{folder_path} does not exist")

    # Check if there's existing data in the collection
    has_existing_data, data_count = check_existing_data()

    if has_existing_data:
        print(f"ℹ️ Found {data_count} existing documents in ChromaDB collection")
        print("🧹 Clearing existing data before adding new data...")

        # Remove all existing data from the collection before adding new data
        try:
            # Use the clear_collection_all function to properly remove all documents
            clear_collection_all(collection)
            print("✅ Successfully cleared existing ChromaDB data")
        except Exception as e:
            print(f"⚠️ Failed to clear existing ChromaDB data: {e}")
            raise e  # Stop the process if we can't clear existing data
    else:
        print("ℹ️ No existing data found in ChromaDB collection, proceeding with new data")

    # Force close any existing connections and clear the data directory
    try:
        # Close existing client connections
        if 'client' in globals():
            del client
        if 'collection' in globals():
            del collection
        print("🔌 Closed existing ChromaDB connections")
    except:
        pass

    # Remove all files and folders under the ChromaDB data directory
    chroma_data_path = "./data/chroma_db"
    if os.path.exists(chroma_data_path):
        print("🧹 Clearing ChromaDB data directory...")
        import time
        time.sleep(1)  # Give time for connections to close

        try:
            # Force remove with error handling
            shutil.rmtree(chroma_data_path, ignore_errors=True)
            print("✅ Successfully cleared ChromaDB data directory")
        except Exception as e:
            print(f"⚠️ Failed to clear ChromaDB data directory: {e}")
            # Try to remove individual files with force
            try:
                for root, dirs, files in os.walk(chroma_data_path, topdown=False):
                    for file in files:
                        file_path = os.path.join(root, file)
                        try:
                            os.chmod(file_path, 0o777)  # Make writable
                            os.remove(file_path)
                        except:
                            pass
                    for dir in dirs:
                        dir_path = os.path.join(root, dir)
                        try:
                            os.chmod(dir_path, 0o777)  # Make writable
                            os.rmdir(dir_path)
                        except:
                            pass
                os.rmdir(chroma_data_path)
                print("✅ Force cleared ChromaDB data directory")
            except Exception as e2:
                print(f"⚠️ Could not clear directory: {e2}")

    # Create a new ChromaDB client and collection with a fresh path
    try:
        # Use a timestamp to ensure unique database
        import time
        timestamp = int(time.time())
        new_db_path = f"./data/chroma_db_{timestamp}"

        # Create the directory with proper permissions
        os.makedirs(new_db_path, mode=0o755, exist_ok=True)

        client = chromadb.PersistentClient(path=new_db_path)
        collection = client.get_or_create_collection(
            name="documents",
            metadata={"hnsw:space": "cosine"}
        )
        print(f"✅ Created new ChromaDB client and collection at: {new_db_path}")

        # Update the global path for future use
        global CHROMA_DB_PATH
        CHROMA_DB_PATH = new_db_path

    except Exception as e:
        print(f"❌ Failed to create new ChromaDB client: {e}")
        raise e

    # Find all files in the folder (filter supported formats)
    supported_extensions = {'.csv', '.doc', '.docx', '.eml', '.epub', '.gif', '.htm', '.html', '.jpeg', '.jpg', '.json', '.log', '.mp3', '.msg', '.odt', '.ogg', '.pdf', '.png', '.pptx', '.ps', '.psv', '.rtf', '.tab', '.tff', '.tif', '.tiff', '.tsv', '.txt', '.wav', '.xls', '.xlsx'}

    file_paths = []
    for root, _, files in os.walk(folder_path):
        for file in files:
            file_path = os.path.join(root, file)
            file_ext = os.path.splitext(file)[1].lower()
            if file_ext in supported_extensions:
                file_paths.append(file_path)
            else:
                print(f"⚠️ Skipping unsupported file format: {file} (extension: {file_ext})")

    print(f"📁 Found {len(file_paths)} files to process")
    if len(file_paths) == 0:
        print("⚠️ No files found in the specified folder")
        return {
            "files_processed": 0,
            "chunks_added": 0,
            "error": "No files found in folder"
        }

    # Process each file
    print("🔄 Processing files...")
    tasks = []
    for file_path in file_paths:
        print(f"  📄 Processing: {os.path.basename(file_path)}")
        tasks.append(process_file(file_path))

    try:
        results = await asyncio.gather(*tasks)
        print("✅ All files processed successfully")
    except Exception as e:
        print(f"❌ Error processing files: {e}")
        return {
            "files_processed": 0,
            "chunks_added": 0,
            "error": f"Error processing files: {str(e)}"
        }

    # Flatten and prepare data for insertion
    all_chunks, all_ids, all_metas = [], [], []
    for i, (chunks, ids, metas) in enumerate(results):
        if chunks:  # Only add if we got content
            all_chunks.extend(chunks)
            all_ids.extend(ids)
            all_metas.extend(metas)
            print(f"  ✅ {os.path.basename(file_paths[i])}: {len(chunks)} chunks")
        else:
            print(f"  ⚠️ {os.path.basename(file_paths[i])}: No content extracted")

    if not all_chunks:
        print("❌ No content extracted from any files")
        return {
            "files_processed": len(file_paths),
            "chunks_added": 0,
            "error": "No content could be extracted from files"
        }

    print(f"📊 Total chunks to add: {len(all_chunks)}")

    try:
        # Generate embeddings
        print("🧠 Generating embeddings...")
        embeddings = await embed(all_chunks)
        print(f"✅ Generated {len(embeddings)} embeddings")

        # Add to ChromaDB
        print("💾 Adding data to ChromaDB...")
        collection.add(
            ids=all_ids,
            documents=all_chunks,
            embeddings=embeddings,
            metadatas=all_metas
    )
        print("✅ Successfully added data to ChromaDB")

        # Verify the data was added
        final_count = collection.count()
        print(f"📈 ChromaDB now contains {final_count} documents")

    except Exception as e:
        print(f"❌ Error adding data to ChromaDB: {e}")
        return {
            "files_processed": len(file_paths),
            "chunks_added": 0,
            "error": f"Error adding to ChromaDB: {str(e)}"
        }

    return {
        "files_processed": len(file_paths),
        "chunks_added": len(all_chunks),
        "final_document_count": final_count
    }

async def process_file(file_path: str):
    """Extract, chunk, and prepare metadata for a single file"""
    try:
        print(f"    🔍 Extracting text from: {os.path.basename(file_path)}")
        text = load_file(file_path)

        if not text or text.strip() == "":
            print(f"    ⚠️ No text extracted from: {os.path.basename(file_path)}")
            return [], [], []

        print(f"    📝 Extracted {len(text)} characters from: {os.path.basename(file_path)}")
        chunks = chunk_text(text)
        print(f"    ✂️ Created {len(chunks)} chunks from: {os.path.basename(file_path)}")

        ids = [f"{os.path.basename(file_path)}_chunk{i}" for i in range(len(chunks))]
        metas = [{"source": file_path}] * len(chunks)

        return chunks, ids, metas

    except Exception as e:
        print(f"    ❌ Error processing {os.path.basename(file_path)}: {e}")
        return [], [], []

def filter_relevant_chunks(user_query: str, documents: list, metadatas: list, min_relevance_score: float = 0.5):
    """
    Filter chunks based on relevance to user query using strict keyword matching and semantic similarity
    """

    user_query_lower = user_query.lower()
    user_keywords = extract_keywords(user_query_lower)

    # Extract specific query intent
    query_intent = extract_query_intent(user_query_lower)

    relevant_chunks = []

    for i, (doc, metadata) in enumerate(zip(documents, metadatas)):
        doc_lower = doc.lower()

        # Calculate relevance score with stricter criteria
        relevance_score = calculate_relevance_score(user_query_lower, doc_lower, user_keywords, query_intent)

        # Only include chunks that meet minimum relevance threshold
        if relevance_score >= min_relevance_score:
            relevant_chunks.append({
                "content": doc,
                "metadata": metadata,
                "relevance_score": relevance_score
            })

    # Sort by relevance score (highest first) and return top results
    relevant_chunks.sort(key=lambda x: x["relevance_score"], reverse=True)
    return relevant_chunks[:3]  # Return only top 3 most relevant chunks

def extract_query_intent(text: str):
    """Extract the specific intent of the user query - simplified and generic"""
    intent = {
        'type': 'general',
        'keywords': []
    }

    # Just return a simple intent without hardcoded terms
    # The system should work for any type of data
    return intent

def extract_keywords(text: str):
    """Extract important keywords from user query with natural language understanding"""
    # Remove common stop words
    stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'what', 'when', 'where', 'why', 'how', 'who', 'which', 'this', 'that', 'these', 'those', 'provide', 'show', 'give', 'tell', 'me', 'details', 'about', 'from', 'get', 'find', 'search', 'look', 'see', 'want', 'need', 'please', 'you', 'your', 'could', 'would', 'can', 'please'}

    # Extract words (alphanumeric only)
    words = re.findall(r'\b\w+\b', text.lower())

    # Filter out stop words and short words, but keep important terms
    keywords = []
    for word in words:
        if word not in stop_words and len(word) > 1:
            keywords.append(word)

    # Add common variations and typo corrections
    expanded_keywords = []
    for keyword in keywords:
        expanded_keywords.append(keyword)

        # Add common variations
        if keyword.endswith('s') and len(keyword) > 3:
            expanded_keywords.append(keyword[:-1])  # Remove 's' for singular
        if not keyword.endswith('s') and len(keyword) > 3:
            expanded_keywords.append(keyword + 's')  # Add 's' for plural

        # Add common typo corrections
        if keyword == 'mailestone':
            expanded_keywords.extend(['milestone', 'milestones'])
        elif keyword == 'milestone':
            expanded_keywords.extend(['mailestone', 'milestones'])
        elif keyword == 'detials':
            expanded_keywords.extend(['details'])
        elif keyword == 'details':
            expanded_keywords.extend(['detials'])

    return list(set(expanded_keywords))  # Remove duplicates

def extract_phrases_and_context(text: str):
    """Extract important phrases and context from natural language queries"""
    text_lower = text.lower()

    # Common phrase patterns
    phrases = []

    # Look for "X details" patterns
    detail_patterns = re.findall(r'(\w+(?:\s+\w+)*)\s+details?', text_lower)
    for pattern in detail_patterns:
        phrases.append(pattern.strip())

    # Look for "provide X" patterns
    provide_patterns = re.findall(r'provide\s+(\w+(?:\s+\w+)*)', text_lower)
    for pattern in provide_patterns:
        phrases.append(pattern.strip())

    # Look for "show X" patterns
    show_patterns = re.findall(r'show\s+(\w+(?:\s+\w+)*)', text_lower)
    for pattern in show_patterns:
        phrases.append(pattern.strip())

    # Look for "X information" patterns
    info_patterns = re.findall(r'(\w+(?:\s+\w+)*)\s+information', text_lower)
    for pattern in info_patterns:
        phrases.append(pattern.strip())

    # Look for "X diagram" patterns
    diagram_patterns = re.findall(r'(\w+(?:\s+\w+)*)\s+diagram', text_lower)
    for pattern in diagram_patterns:
        phrases.append(pattern.strip())

    # Look for "X architecture" patterns
    arch_patterns = re.findall(r'(\w+(?:\s+\w+)*)\s+architecture', text_lower)
    for pattern in arch_patterns:
        phrases.append(pattern.strip())

    return phrases

def find_relevant_chunks_hybrid(user_query: str, documents: list, metadatas: list, search_terms: list):
    """
    Find relevant chunks using hybrid keyword and phrase matching
    """
    user_query_lower = user_query.lower()
    relevant_chunks = []

    for i, (doc, metadata) in enumerate(zip(documents, metadatas)):
        doc_lower = doc.lower()

        # Check for both individual keywords and phrases
        matches = 0
        match_types = []

        for term in search_terms:
            if term in doc_lower:
                matches += 1
                if ' ' in term:  # It's a phrase
                    match_types.append('phrase')
                else:  # It's a keyword
                    match_types.append('keyword')

        # Only include documents that have at least one match
        if matches > 0:
            # Extract only the relevant sentences/paragraphs containing search terms
            relevant_content = extract_relevant_sentences(doc, search_terms)

            if relevant_content:  # Only add if we found relevant content
                # Calculate relevance score with bonus for phrase matches
                base_score = matches / len(search_terms) if search_terms else 0
                phrase_bonus = 0.2 if 'phrase' in match_types else 0
                relevance_score = min(base_score + phrase_bonus, 1.0)

                relevant_chunks.append({
                    "content": relevant_content,
                    "metadata": metadata,
                    "relevance_score": relevance_score,
                    "matches": matches,
                    "match_types": match_types
                })

    # Sort by relevance score (highest first) and return top results
    relevant_chunks.sort(key=lambda x: x["relevance_score"], reverse=True)
    return relevant_chunks[:3]  # Return only top 3 most relevant chunks

def find_relevant_chunks_by_keywords(user_query: str, documents: list, metadatas: list, user_keywords: list):
    """
    Find relevant chunks using direct keyword matching and extract only relevant sentences
    """
    user_query_lower = user_query.lower()
    relevant_chunks = []

    for i, (doc, metadata) in enumerate(zip(documents, metadatas)):
        doc_lower = doc.lower()

        # Check if document contains any of the user keywords
        keyword_matches = 0
        for keyword in user_keywords:
            if keyword in doc_lower:
                keyword_matches += 1

        # Only include documents that have at least one keyword match
        if keyword_matches > 0:
            # Extract only the relevant sentences/paragraphs containing keywords
            relevant_content = extract_relevant_sentences(doc, user_keywords)

            if relevant_content:  # Only add if we found relevant content
                # Calculate a simple relevance score based on keyword matches
                relevance_score = keyword_matches / len(user_keywords) if user_keywords else 0

                relevant_chunks.append({
                    "content": relevant_content,
                    "metadata": metadata,
                    "relevance_score": relevance_score,
                    "keyword_matches": keyword_matches
                })

    # Sort by relevance score (highest first) and return top results
    relevant_chunks.sort(key=lambda x: x["relevance_score"], reverse=True)
    return relevant_chunks[:3]  # Return only top 3 most relevant chunks

def extract_relevant_sentences(text: str, keywords: list):
    """
    Extract only sentences or paragraphs that contain the specified keywords
    """
    if not keywords:
        return text

    # Split text into sentences
    sentences = re.split(r'[.!?]+', text)
    relevant_sentences = []

    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue

        sentence_lower = sentence.lower()

        # Check if sentence contains any of the keywords
        for keyword in keywords:
            if keyword in sentence_lower:
                relevant_sentences.append(sentence)
                break  # Don't add the same sentence multiple times

    # If we found relevant sentences, return them
    if relevant_sentences:
        return '. '.join(relevant_sentences) + '.'

    # If no sentences found, try paragraph-based extraction
    paragraphs = text.split('\n\n')
    relevant_paragraphs = []

    for paragraph in paragraphs:
        paragraph = paragraph.strip()
        if not paragraph:
            continue

        paragraph_lower = paragraph.lower()

        # Check if paragraph contains any of the keywords
        for keyword in keywords:
            if keyword in paragraph_lower:
                relevant_paragraphs.append(paragraph)
                break

    if relevant_paragraphs:
        return '\n\n'.join(relevant_paragraphs)

    # If still nothing found, return empty string
    return ""

def calculate_relevance_score(user_query: str, document: str, user_keywords: list, query_intent: dict):
    """Calculate simple relevance score based on keyword matching"""
    score = 0.0

    # Direct keyword matching
    keyword_matches = 0
    for keyword in user_keywords:
        if keyword in document.lower():
            score += 0.5
            keyword_matches += 1

    # Bonus for multiple keyword matches
    if keyword_matches >= 2:
        score += 0.2

    return min(score, 1.0)  # Cap at 1.0

async def query_with_prompt(user_text: str, top_k: int = 5):
    """Retrieve data using hybrid keyword and phrase-based search"""

    # Extract keywords and phrases from user query
    user_keywords = extract_keywords(user_text.lower())
    user_phrases = extract_phrases_and_context(user_text.lower())

    # Combine keywords and phrases for comprehensive search
    all_search_terms = user_keywords + user_phrases

    # Get all documents from the collection
    all_docs = collection.get()

    if not all_docs["documents"]:
        return {
            "answer": "No documents found in the database. Please upload some documents first.",
            "sources": []
        }

    # Find relevant chunks using hybrid search
    relevant_chunks = find_relevant_chunks_hybrid(user_text, all_docs["documents"], all_docs["metadatas"], all_search_terms)

    # If no relevant chunks found, return a helpful message
    if not relevant_chunks:
        search_terms_display = ', '.join(all_search_terms[:5])  # Show first 5 terms
        return {
            "answer": f"I couldn't find any information containing: {search_terms_display}. Please try using different keywords or check if the information exists in your documents.",
            "sources": []
        }

    context_chunks = "\n\n".join([chunk["content"] for chunk in relevant_chunks])
    sources = [chunk["metadata"] for chunk in relevant_chunks]

    prompt = f"""
            [ROLE]
            You are a professional assistant. Answer the user's question using ONLY the provided context.

            [CRITICAL INSTRUCTION]
            - Use ONLY the information provided in the context below.
            - Do NOT add any information not present in the context.
            - If the context contains the answer, provide it in a clear, human-readable format.
            - If the context doesn't contain the answer, say: "I don't have that information in the database."
            - Format tabular data in a readable table format.
            - Use bullet points for lists.
            - Keep your response concise and well-structured.

            [CONTEXT]
            {context_chunks}

            [USER QUESTION]
            {user_text}

            [RESPONSE]
            """

    # 5. Call local LLM (example: Ollama) with fallback
    try:
        process = subprocess.run(
            ["ollama", "run", "mistral"],  # you can swap model
            input=prompt,
            text=True,
            capture_output=True,
            timeout=30  # Add timeout to prevent hanging
        )

        if process.returncode == 0:
            answer = process.stdout.strip()
        else:
            answer = f"Error running LLM: {process.stderr.strip()}"

    except FileNotFoundError:
        # Fallback when Ollama is not installed - format the response properly
        answer = format_fallback_response(context_chunks, user_text)
    except subprocess.TimeoutExpired:
        answer = "The AI model is taking too long to respond. Please try again."
    except Exception as e:
        answer = f"An error occurred while processing your request: {str(e)}"

    return {
        "answer": answer,
        "sources": sources
    }
