from typing import Any, Dict
from fastapi import APIRouter, Request
from pydantic import BaseModel
from ..services.assistant_service import query_project_assistant

router = APIRouter(prefix="/assistant", tags=["assistant"])


class AssistantQueryRequest(BaseModel):
    query: str


@router.post("/query")
def ask_assistant(req: AssistantQueryRequest, request: Request) -> Dict[str, Any]:
    """
    Project Intelligence Assistant querying loaded project facts.
    """
    projects = request.app.state.scored_projects
    summary = request.app.state.portfolio_summary
    return query_project_assistant(req.query, projects, summary)
