export default class DraggableUtil {
    /**
     * Makes an element draggable within a workspace
     * 
     * @param {HTMLElement} element - The element to make draggable
     * @param {Object} options - Configuration options
     * @param {string} options.workspaceId - ID of the workspace (default: 'workspace')
     * @param {number} options.zIndexDragging - z-index when dragging (default: 1000)
     * @param {number} options.zIndexResting - z-index when not dragging (default: 1)
     * @param {Function} options.shouldDrag - Function returning boolean to determine if drag should start (e) => boolean
     */
    static makeDraggable(element, options = {}) {
        const config = {
            workspaceId: options.workspaceId || 'workspace',
            zIndexDragging: options.zIndexDragging || 1000,
            zIndexResting: options.zIndexResting || 1,
            shouldDrag: options.shouldDrag || (() => true)
        };
        
        let isDragging = false;
        let offsetX, offsetY;
        
        // Handle drag start
        element.addEventListener('mousedown', (e) => {
            // Check if dragging should be allowed (custom logic)
            if (!config.shouldDrag(e)) {
                return;
            }
            
            isDragging = true;
            const rect = element.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            element.style.zIndex = config.zIndexDragging;
        });
        
        // Handle dragging
        const mouseMoveHandler = (e) => {
            if (!isDragging) return;
            
            // Get current workspace (could be different if we switched halls)
            const workspace = document.getElementById(config.workspaceId);
            if (!workspace) return;
            
            const workspaceRect = workspace.getBoundingClientRect();
            
            // Calculate new position within bounds of workspace
            let newX = e.clientX - workspaceRect.left - offsetX;
            let newY = e.clientY - workspaceRect.top - offsetY;
            
            // Constrain to workspace boundaries
            newX = Math.max(0, Math.min(newX, workspaceRect.width - element.offsetWidth));
            newY = Math.max(0, Math.min(newY, workspaceRect.height - element.offsetHeight));
            
            element.style.left = newX + 'px';
            element.style.top = newY + 'px';
        };
        
        // Handle drag end
        const mouseUpHandler = () => {
            if (isDragging) {
                isDragging = false;
                element.style.zIndex = config.zIndexResting;
            }
        };
        
        // Add global event listeners
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
        
        // Return a function to clean up event listeners if needed
        return function cleanup() {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };
    }
    
    /**
     * Updates the workspace ID for draggable elements
     * 
     * @param {string} newWorkspaceId - The new workspace ID
     */
    static updateWorkspaceId(newWorkspaceId) {
        // This method could be called when switching between halls
        // It would be used if implementing a more complex draggable system
        // For the current implementation, pass the workspaceId in options when calling makeDraggable
    }
}
