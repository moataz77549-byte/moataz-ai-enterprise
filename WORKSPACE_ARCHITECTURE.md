# AI Workspace Architecture

Details the multi-tenant workspace isolation layout of **Moataz AI**.

---

## 1. Multi-Tenant Boundaries
A tenant belongs to an Organization containing multiple Teams and Workspaces.
- Projects are bounded within a single Workspace.
- Users can switch workspaces using the top dropdown switcher, which updates the Zustand state `activeWorkspaceId`.

---

## 2. Shared Registry Locator
Concrete database repos are located via our unified Service Locator, separating business actions from raw database connections.
