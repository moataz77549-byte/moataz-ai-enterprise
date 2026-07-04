# Background Queue Architecture Specification

This document details the worker thread configurations and queue jobs utilizing **BullMQ**.

---

## 1. Background Workers
We run concurrency pools using Redis-backed queues:
- **Queue name**: `moataz-ai-background-jobs`.
- **Job types**:
  - `file-processing`: Runs text parsing, chunk splitting, and embeddings.
  - `virus-scan`: Checks uploaded file buffers.
  - `ocr-extraction`: Extracts text from document images.

---

## 2. Retry Policies
BullMQ jobs use automatic exponential backoff configurations:
- **Attempts**: 3.
- **Delay**: 1000ms.
- Unrecoverable jobs are routed to standard logging/dead-letter formats.
