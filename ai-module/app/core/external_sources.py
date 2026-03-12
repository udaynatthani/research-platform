import requests
from typing import List


def fetch_external_sources(query: str, limit: int = 5) -> List[str]:
    """
    Fetch abstracts from Semantic Scholar API for plagiarism comparison.
    Returns a list of abstract texts.
    """

    try:
        url = "https://api.semanticscholar.org/graph/v1/paper/search"
        params = {
            "query": query[:200],
            "limit": limit,
            "fields": "abstract"
        }

        response = requests.get(url, params=params, timeout=10)

        if response.status_code != 200:
            return []

        data = response.json()
        papers = data.get("data", [])

        abstracts = []
        for paper in papers:
            abstract = paper.get("abstract")
            if abstract and len(abstract) > 50:
                abstracts.append(abstract)

        return abstracts

    except Exception:
        return []