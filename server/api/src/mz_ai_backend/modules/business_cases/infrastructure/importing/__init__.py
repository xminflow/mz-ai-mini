"""Case directory importing tools for the business_cases module.

Usage:
- Import `BusinessCaseDirectoryImporter` to turn one local case directory into
  a published business case recreation.
- Import `CaseImportCloudBaseSettings` and `CloudBaseStorageClient` to configure
  CloudBase asset uploads and cleanup for the importer.
- Import config supports case-level `type`, `industry`, `tags`, and one shared
  case cover image. Document entries only carry markdown file references.
- Case imports additionally read `business_model.md` from the case directory and
  expose it as the `商业模式` document.
- Project imports additionally read `how_to_do.md` from the case directory and
  expose it as the `如何做` document.

Development rules:
- Keep filesystem parsing and object storage details inside this package.
- Recreate duplicate `case_id` imports by deleting the whole
  `business-cases/{case_id}` directory and persisted rows before creating the
  new business case.
"""

from .cloudbase_client import CloudBaseStorageClient
from .models import CaseImportCloudBaseSettings, CaseImportResult
from .service import BusinessCaseDirectoryImporter

__all__ = [
    "BusinessCaseDirectoryImporter",
    "CaseImportCloudBaseSettings",
    "CaseImportResult",
    "CloudBaseStorageClient",
]
