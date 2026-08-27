import os
import pytest

def test_directories_exist():
    expected_directories = [
        "data/raw",
        "data/processed",
        "data/train",
        "data/validation",
        "data/test",
        "models",
        "reports",
        "notebooks",
        "tests",
        "docs",
        "src/data_preprocessing",
        "src/eda",
        "src/feature_engineering",
        "src/ml_models",
        "src/medical_image_analysis",
        "src/disease_prediction",
        "src/clinical_decision_support",
        "src/nlp"
    ]

    for directory in expected_directories:
        assert os.path.isdir(directory), f"Directory {directory} is missing"

def test_files_exist():
    expected_files = [
        "app.py",
        "requirements.txt",
        "README.md",
        ".gitignore",
        "Dockerfile",
        "docker-compose.yml",
        "config/config.yaml",
        "docs/architecture.md"
    ]

    for file in expected_files:
        assert os.path.isfile(file), f"File {file} is missing"

def test_init_files_exist():
    expected_init_files = [
        "src/__init__.py",
        "src/data_preprocessing/__init__.py",
        "src/ml_models/__init__.py"
    ]

    for file in expected_init_files:
        assert os.path.isfile(file), f"Init file {file} is missing"
