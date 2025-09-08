from setuptools import setup, find_packages

setup(
    name="starcoder2-cli",
    version="0.1.0",
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        "Click>=8.0",
        "requests>=2.31.0",
    ],
    entry_points={
        "console_scripts": [
            "starcoder2=starcoder2:cli",
        ],
    },
    author="knoksen",
    author_email="contact@knoksen.com",
    description="CLI tool for Starcoder2 API",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/knoksen/knoksPix",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3.10",
    ],
)
