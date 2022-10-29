[v]1. update MmNode's getPortLocation method for straightline links
  - mathematically derive port location thru intersection computation
  - move getPortLocation() out of object, as standalone in canvas comp for now

[v]2. do other stuff to change link to straightlines connecting node center-to-center
  - curves, complexity unjustified, tracing curves for space alloc is a nightmare
  - forgot what i meant by other stuff, so mark as complete i guess =p

3. once links straight line, update link tracing methods, i think allocLink() mostly?
  - put link space usage on the radar

4. update reasonable space alloc framework with links on radar, the radial search should
    check for link space availability as well to determine if a point in scope can host a child node specifically

5. link command should handle the case that a child is taken from its parent and respond in a 
    reasonable manner

6. start working on the generative order update, clean up the src code and review the current framework

7. how should mindmaps be represented in persistent storage?

8. how to save/load mindmap module context from persistent storage?

9. implement backend services, most relevantly, for the mindmap and todo list modules

10. todo list commit feature, recurring daily compartmentalization tasks

