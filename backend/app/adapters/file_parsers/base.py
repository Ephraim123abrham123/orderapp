from abc import ABC, abstractmethod
from typing import List, Dict, Any


class FileParserPort(ABC):
    """Abstract port for parsing uploaded raw files into dictionary lists"""
    
    @abstractmethod
    def parse(self, file_bytes: bytes) -> List[Dict[str, Any]]:
        """
        Parses raw bytes of the file and returns a list of dictionaries.
        Each dictionary represents a row mapping keys (columns) to values.
        """
        pass
