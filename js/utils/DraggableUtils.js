export default class DraggableUtil {
  static makeDraggable(element, options = {}) {
    const config = {
      zIndexDragging: options.zIndexDragging || 1000,
      zIndexResting: options.zIndexResting || 1,
    };

    let isDragging = false;
    let offsetX, offsetY;

    element.addEventListener("mousedown", (e) => {
      isDragging = true;
      const rect = element.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      element.style.zIndex = config.zIndexDragging;
    });

    const mouseMoveHandler = (e) => {
      if (!isDragging) return;

      const workspace = document.querySelector(
        ".workspace:not([style*='display: none'])"
      );
      if (!workspace) return;

      const workspaceRect = workspace.getBoundingClientRect();

      let newX = e.clientX - workspaceRect.left - offsetX;
      let newY = e.clientY - workspaceRect.top - offsetY;

      newX = Math.max(
        0,
        Math.min(newX, workspaceRect.width - element.offsetWidth)
      );
      newY = Math.max(
        0,
        Math.min(newY, workspaceRect.height - element.offsetHeight)
      );

      element.style.left = newX + "px";
      element.style.top = newY + "px";
    };

    const mouseUpHandler = () => {
      if (isDragging) {
        isDragging = false;
        element.style.zIndex = config.zIndexResting;
      }
    };

    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);

    return function cleanup() {
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", mouseUpHandler);
    };
  }
}
