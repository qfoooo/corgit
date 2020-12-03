const axios = require("axios")

const getCommit = client => repo => async commit => {
  return await client.get(`/repos/${repo}/git/commits/${commit}`).then(res => res.data)
}

const getPrFromCommit = client => repo => async commit => {
  const cm = await getCommit(client)(repo)(commit)
  try {
    const pr = await client.post("/graphql", {
      query: `
        query {
          node(id:"${cm.node_id}") {
            ... on Commit {
              message
              associatedPullRequests(first: 5) {
                nodes {
                  ... on PullRequest {
                    id
                    url
                    title
                    timelineItems(itemTypes: CONNECTED_EVENT, last: 1) {
                      nodes {
                        ... on ConnectedEvent {
                          subject {
                            ... on Issue {
                              id
                              url
                              title
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `
    }).then(d => d.data.data.node)
    return {
      ...pr,
      associatedPullRequests: pr.associatedPullRequests.nodes.map(node => ({
        ...node,
        timelineItems: node.timelineItems.nodes.map(n => n.subject)
      }))
    }
  }
  catch (e) {
    console.error(e.response.status)
  }
}

module.exports = config => {
  const client = axios.create({
    baseURL: "https://api.github.com",
    headers: { Authorization: `Bearer ${config.pat}`}
  })

  return config => {
    const repo = config.remote.origin.url.split(":")[1].slice(0, -4)

    return {
      getPrFromCommit: getPrFromCommit(client)(repo)
    }
  }
}