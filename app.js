class DragAndDrop {
  selectors = {
    root: "[data-js-dnd]",
    cart: ".banner__cart",
    cartZone: ".banner__cart-zone",
    link: ".banner__link",
  };

  stateClasses = {
    isDragging: "is-dragging",
    isActive: "is-active",
    cartBlink: "cart-blink",
    cartScaleUp: "cart-scale-up",
  };

  initialState = {
    offsetX: null,
    offsetY: null,
    isDragging: false,
    currentDraggingElement: null,
    itemsInCart: 0,
  };

  constructor() {
    this.state = { ...this.initialState };
    this._cacheDOM();
    this._bindEvents();
  }

  _cacheDOM() {
    this.cartZone = document.querySelector(this.selectors.cartZone);
    this.bannerLink = document.querySelector(this.selectors.link);
  }

  _resetState() {
    this.state.isDragging = false;
    this.state.currentDraggingElement = null;
  }

  _onPointerDown(event) {
    const { target } = event;
    if (!target.matches(this.selectors.root)) return;

    target.classList.add(this.stateClasses.isDragging);
    const { left, top } = target.getBoundingClientRect();

    this.state = {
      ...this.state,
      offsetX: event.pageX - left,
      offsetY: event.pageY - top,
      isDragging: true,
      currentDraggingElement: target,
    };

    this._triggerCartBlink();
  }

  _onPointerMove(event) {
    if (!this.state.isDragging) return;

    const { currentDraggingElement, offsetX, offsetY } = this.state;
    const shelfRect = currentDraggingElement
      .closest(".banner__shelf")
      .getBoundingClientRect();

    const x = event.pageX - offsetX - shelfRect.left;
    const y = event.pageY - offsetY - shelfRect.top;

    this._updateElementPosition(currentDraggingElement, x, y);

    if (this._isInCartZone(currentDraggingElement)) {
      this.cartZone.classList.remove(this.stateClasses.cartBlink);
    } else {
      this._triggerCartBlink();
    }
  }

  _updateElementPosition(element, x, y) {
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  }

  _triggerCartBlink() {
    this.cartZone.classList.add(this.stateClasses.cartBlink);
  }

  _onPointerUp() {
    if (!this.state.isDragging) return;

    if (this._isInCartZone(this.state.currentDraggingElement)) {
      this._handleItemInCart();
      this._triggerCartScaleUp();
      this.cartZone.classList.remove(this.stateClasses.cartBlink);
    } else {
      this.cartZone.classList.remove(this.stateClasses.cartBlink);
    }

    this.state.currentDraggingElement.classList.remove(
      this.stateClasses.isDragging
    );
    this._resetState();
  }

  _isInCartZone(item) {
    const zoneRect = this.cartZone.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    return (
      itemRect.right > zoneRect.left &&
      itemRect.left < zoneRect.right &&
      itemRect.bottom > zoneRect.top &&
      itemRect.top < zoneRect.bottom
    );
  }

  _handleItemInCart() {
    this.state.itemsInCart += 1;
    this.state.currentDraggingElement.setAttribute("disabled", "");

    if (this.state.itemsInCart >= 11) {
      this._showSuccessMessage();
    } else if (this.state.itemsInCart >= 3) {
      this._activateLink();
    }
  }

  _triggerCartScaleUp() {
    this.cartZone.classList.add(this.stateClasses.cartScaleUp);
    setTimeout(() => {
      this.cartZone.classList.remove(this.stateClasses.cartScaleUp);
    }, 500);
  }

  _showSuccessMessage() {
    alert("Молодец! Ты добавил все 11 товаров!");
    location.reload();
  }

  _activateLink() {
    this.bannerLink.classList.add(this.stateClasses.isActive);
  }

  _bindEvents() {
    document.addEventListener("pointerdown", (event) =>
      this._onPointerDown(event)
    );
    document.addEventListener("pointermove", (event) =>
      this._onPointerMove(event)
    );
    document.addEventListener("pointerup", () => this._onPointerUp());
  }
}

new DragAndDrop();
