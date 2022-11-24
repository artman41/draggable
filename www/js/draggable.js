(function() {
    function onload(event) {

        let deltaX = 0, deltaY = 0;
        let isDraggingSomething = false;
        let dragTarget = undefined;

        let posX = 0, posY = 0;

        function toDraggable(elem) {
            [
                ["setIsDragging", function(b) {this.setAttribute("draggable-isDragging", b === true)}],
                ["isDragging", function() {return this.getAttribute("draggable-isDragging") === "true"}],
                ["setPosition", function(x, y) {
                    normaliseX = (n) => {
                        let computedStyleMap = this.computedStyleMap();
                        let thisRect = this.getBoundingClientRect();
                        let parentRect = this.parentElement.getBoundingClientRect();
                        let paddingLeft = computedStyleMap.get("padding-left").value;
                        let borderWidth = (computedStyleMap.get("border-top-left-radius") ?? computedStyleMap.get("border-bottom-left-radius")).value / 100;
                        if ((n - paddingLeft - borderWidth) < 0)
                            return paddingLeft + borderWidth;
                        else if((n+ thisRect.width + borderWidth) > parentRect.right)
                            return parentRect.right - thisRect.width - borderWidth;
                        else
                            return n;
                    };
                    normaliseY = (n) => {
                        let computedStyleMap = this.computedStyleMap();
                        let thisRect = this.getBoundingClientRect();
                        let parentRect = this.parentElement.getBoundingClientRect();
                        let paddingTop = computedStyleMap.get("padding-top").value;
                        let paddingBottom = computedStyleMap.get("padding-bottom").value;
                        let borderWidth = (computedStyleMap.get("border-top-left-radius") ?? computedStyleMap.get("border-top-right-radius")).value / 100;
                        if ((n - paddingTop - borderWidth) < 0)
                            return paddingTop + borderWidth;
                        else if((n+paddingBottom + borderWidth) > parentRect.bottom)
                            return parentRect.bottom - thisRect.height - borderWidth;
                        else
                            return n;
                    };

                    posX = normaliseX(x - deltaX);
                    posY = normaliseY(y - deltaY);
                    console.log("Actual: %O, Normalised: %O", x - deltaX, posX);
                    console.log("Actual: %O, Normalised: %O", y - deltaY, posY);
                    this.style.position = "absolute";
                    this.style.left = `${window.scrollX + posX}px`;
                    this.style.top = `${window.scrollY + posY}px`;
                }],
                ["resetPosition", function() {
                    this.style.left = `${window.scrollX + posX}px`;
                    this.style.top = `${window.scrollY + posY}px`;
                }],
            ].forEach(([funcName, func]) => elem[funcName] = func.bind(elem));
            return elem;
        }

        function onPointerDown(event) {
            const draggable = toDraggable(event.target);
            let {left: left, top: top} = draggable.getBoundingClientRect();
            deltaX = event.clientX - left;
            deltaY = event.clientY - top;
            draggable.setIsDragging(true);
            isDraggingSomething = true;
            dragTarget = this;
            draggable.parentElement.lastElementChild.after(draggable);
            this.dispatchEvent(new CustomEvent("draggablePickup", {bubbles: true, detail: {x: posX, y: posY} }));
            console.log("[%O] <%O> Event: %O, %O", event.type, event.target, event, [left, top]);
        }
        function onPointerUp(event) {
            const draggable = toDraggable(event.target);
            draggable.setIsDragging(false);
            isDraggingSomething = false;
            dragTarget = undefined;
            this.dispatchEvent(new CustomEvent("draggableDrop", {bubbles: true, detail: {x: posX, y: posY} }));
            console.log("[%O] <%O> Event: %O", event.type, event.target, event);
        }
        function onPointerCancel(event) {
            const draggable = toDraggable(event.target);
            console.log("[%O] <%O> Event: %O", event.type, event.target, event);
        }
        function onPointerMove(event) {
            const draggable = toDraggable(event.target);
            if(!draggable.isDragging()){
                return;
            }
            draggable.setPosition(event.clientX, event.clientY);
            this.dispatchEvent(new CustomEvent("draggableMove", {bubbles: true, detail: {x: posX, y: posY} }));
            console.log("[%O] <%O> Event: %O", event.type, event.target, event);
        }

        function onPointerLeave(event) {
            const draggable = toDraggable(event.target);
            if(!draggable.isDragging()){
                return;
            }
            draggable.setPosition(event.clientX, event.clientY);
            this.dispatchEvent(new CustomEvent("draggableMove", {bubbles: true, detail: {x: posX, y: posY} }));
            console.log("[%O] <%O> Event: %O", event.type, event.target, event);
        }

        let draggableElems = document.querySelectorAll("[draggable]");
        draggableElems.forEach(o => {
            o.addEventListener("pointerdown", onPointerDown, {capture: true});
            o.addEventListener("pointerup", onPointerUp, {capture: true});
            o.addEventListener("pointercancel", onPointerCancel, {capture: true});
            o.addEventListener("pointermove", onPointerMove, {capture: true});
            o.addEventListener("pointerleave", onPointerLeave, {capture: true});
        });

        window.addEventListener("onselectstart", (_event) => !isDraggingSomething);
        window.addEventListener("scroll", (_event) => { if(isDraggingSomething && dragTarget !== undefined) dragTarget.resetPosition(); });
    }

    window.addEventListener("load", onload);
})();