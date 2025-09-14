# -*- mode: python ; coding: utf-8 -*-
import os
import sys

# Get the current directory
current_dir = os.path.dirname(os.path.abspath(SPEC))
server_dir = current_dir
dist_dir = os.path.join(server_dir, 'dist')

# Create dist directory if it doesn't exist
os.makedirs(dist_dir, exist_ok=True)

# Build datas list dynamically
datas = []
if os.path.exists(os.path.join(server_dir, 'data')):
    datas.append((os.path.join(server_dir, 'data'), 'data'))

# Add .env file if it exists
env_file = os.path.join(server_dir, '.env')
if os.path.exists(env_file):
    datas.append((env_file, '.'))

# Add Python modules
for module_dir in ['utils', 'Controller', 'router', 'Schema', 'middleware']:
    module_path = os.path.join(server_dir, module_dir)
    if os.path.exists(module_path):
        datas.append((module_path, module_dir))

a = Analysis(
    ['main.py'],
    pathex=[server_dir],
    binaries=[],
    datas=datas,
    hiddenimports=[
        'fastapi',
        'uvicorn',
        'pydantic',
        'starlette',
        'anyio',
        'h11',
        'httptools',
        'websockets',
        'uvloop',
        'watchfiles',
        'python_dotenv',
        'typer',
        'rich',
        'click',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        'tkinter',
        'matplotlib',
        'numpy.distutils',
        'scipy',
        'pandas',
        'PIL',
        'cv2',
        'sklearn',
        'tensorflow',
        'torch',
        'transformers',
        'sentence_transformers',
        'instructorembedding',
        'InstructorEmbedding',
        'chromadb',
        'jupyter',
        'notebook',
        'IPython',
    ],
    noarchive=False,
    optimize=0,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=None)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='myaccobot-backend-minimal',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
