# ADR 0001: AI Provider Choice

## Status
Accepted

## Context
CroweCad uses AI services for CAD generation and assistant features. The current implementation relies solely on the OpenAI API. Although the `@anthropic-ai/sdk` package is present, no Anthropiс-specific code paths exist yet.

## Decision
OpenAI is the default and only supported AI provider for now. Set `AI_PROVIDER=openai` and supply `OPENAI_API_KEY`. Support for additional providers such as Anthropic may be explored in the future.

## Consequences
- Documentation and configuration default to OpenAI.
- Attempting to configure `AI_PROVIDER=anthropic` will have no effect until implementation is added.

