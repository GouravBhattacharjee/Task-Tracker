import logging
import sys

# Set up basic configuration for logging
logging.basicConfig(
    level=logging.INFO,
    format="%(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)

# Create a logger for use in other modules
logger = logging.getLogger(__name__)

# Suppress overly verbose logs from Azure SDK
logging.getLogger("azure").setLevel(logging.WARNING)
