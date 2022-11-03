------------------------------------------------------------------------------------------------------
pre generative order update items:

[v]1. update MmNode's getPortLocation method for straightline links
  - mathematically derive port location thru intersection computation
  - move getPortLocation() out of object, as standalone in canvas comp for now

[v]2. do other stuff to change link to straightlines connecting node center-to-center
  - curves, complexity unjustified, tracing curves for space alloc is a nightmare
  - forgot what i meant by other stuff, so mark as complete i guess =p

[v]3. once links straight line, update link tracing methods, i think allocLink() mostly?
  - put link space usage on the radar

------------------------------------------------------------------------------------------------------
3.4 generative order update:

<!-- 3.4 generative order update, clean up the src code -->
  - start with drawing out the structure mm

3.4.extras
  - getting canvas onChange to proc even with repeated user input
  - consider how 3+ bullet points in this doc can be incorporated into the GO update
  - bubble dims !== border box dims, check for a,b usage when entityWidth/Height should be used
  - lots of 'diff-by-1' kind of directional differences, recheck later checklinkspace stuff
  - review src code fx ordering for 3.4.2 & +
  - document assertions like connectedness of commands e user input as premise of fx like buildextree etc etc

3.4.1 mm-service 
  [v] clean up src code -> update and trim comments
  [v] review src code fx ordering
  - rework buildExecutionTree() logic
    - for loop -> while
    - reconsider how assertions around cmd name and cmd lvls are done -> really necessary to call helper methods? what about HT?
    - update logic to more reasonably respond to user expression with nested commands
      - prioritize execution order based on cmd lvl, not left->right flat ordering
    
    [v] imp lvl 1 cmd 'edit' & unit test
    [v] update buildExecutionTree() logic to handle building generally
    [v] use edit to form testing basis for correctness of execution tree production & ordering in mm-service
    - make generate inference work with stuff like edit 
  
  - review buildExecutionTree and resolve smaller issues, including what is above
  
3.4.2 data-typing
  - review data-typing decisions to better support canvas functions
    - clean up src code, update and trim comments
    - compartmentalize data-typing file into directory format
      - split into smaller files, each file for typing of a specific purpose
    - for canvas related data types
      - review obj functions, update or trim as necessary
      - check how reference storing is handled across the framework

3.4.3 mm-canvas interpretation response functions
  - clean up src code, update or trim comments as necessary
    [v] trim dated comments
  - feather out the canvas scope testing framework

3.4.4 normalizing display window and cell related dimension settings

3.4.5 review logic used in response functions

3.4.6 restoring program internal coherence
  - - reflect data-typing changes to related components to restore program internal coherence

------------------------------------------------------------------------------------------------------
post processing & misc items:

3.5. ownership based free that includes associated links

3.6. recursive child relocate needs to be perform in an atomic manner
      - else not enough context to know if child's child will be deadlocked out of space

4. update reasonable space alloc framework with links on radar, the radial search should
    check for link space availability as well to determine if a point in scope can host a child node specifically
      - iterative deepening with lim >= 1, update out old position as lim structure

5. link command should handle the case that a child is taken from its parent and respond in a 
    reasonable manner

6. start working on the generative order update, clean up the src code and review the current framework

7. how should mindmaps be represented in persistent storage?

8. how to save/load mindmap module context from persistent storage?

9. implement backend services, most relevantly, for the mindmap and todo list modules

10. todo list commit feature, recurring daily compartmentalization tasks

