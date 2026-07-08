import io
import openpyxl
from typing import List, Dict, Any
from app.adapters.file_parsers.base import FileParserPort
from app.core.exceptions import InvalidFileFormatException


class ExcelParserAdapter(FileParserPort):
    """Excel parser implementation using openpyxl"""
    
    def parse(self, file_bytes: bytes) -> List[Dict[str, Any]]:
        try:
            # Load workbook from in-memory bytes
            workbook = openpyxl.load_workbook(filename=io.BytesIO(file_bytes), data_only=True)
            sheet = workbook.active
            if sheet is None:
                return []
            
            rows = list(sheet.iter_rows(values_only=True))
            if not rows:
                return []
            
            # Extract and normalize headers: lowercase, stripped of spaces
            headers = []
            for i, cell in enumerate(rows[0]):
                if cell is not None:
                    headers.append(str(cell).strip().lower())
                else:
                    headers.append(f"column_{i}")
            
            parsed_data = []
            for row_idx, row_values in enumerate(rows[1:], start=2):
                # Check if row is completely empty
                if all(val is None or str(val).strip() == "" for val in row_values):
                    continue
                
                row_dict = {}
                for col_idx, val in enumerate(row_values):
                    if col_idx < len(headers):
                        row_dict[headers[col_idx]] = val
                
                # Append row number for error logging reference
                row_dict["_row_number"] = row_idx
                parsed_data.append(row_dict)
                
            return parsed_data
        except Exception as e:
            raise InvalidFileFormatException(f"Error parsing Excel spreadsheet: {str(e)}")
