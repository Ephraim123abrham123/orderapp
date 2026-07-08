import io
import csv
from typing import List, Dict, Any
from app.adapters.file_parsers.base import FileParserPort
from app.core.exceptions import InvalidFileFormatException


class CsvParserAdapter(FileParserPort):
    """CSV parser implementation using Python's standard csv module"""
    
    def parse(self, file_bytes: bytes) -> List[Dict[str, Any]]:
        try:
            # Decode bytes to text format
            text = file_bytes.decode('utf-8')
            f = io.StringIO(text)
            reader = csv.reader(f)
            rows = list(reader)
            
            if not rows:
                return []
                
            # Extract and normalize headers
            headers = [str(h).strip().lower() for h in rows[0]]
            
            parsed_data = []
            for row_idx, row_values in enumerate(rows[1:], start=2):
                # Skip empty lines
                if not row_values or all(str(val).strip() == "" for val in row_values):
                    continue
                    
                row_dict = {}
                for col_idx, val in enumerate(row_values):
                    if col_idx < len(headers):
                        row_dict[headers[col_idx]] = val
                
                row_dict["_row_number"] = row_idx
                parsed_data.append(row_dict)
                
            return parsed_data
        except Exception as e:
            raise InvalidFileFormatException(f"Error parsing CSV spreadsheet: {str(e)}")
