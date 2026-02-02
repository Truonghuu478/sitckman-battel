// Mock canvas and DOM APIs for testing
global.HTMLCanvasElement.prototype.getContext = () => ({
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    lineCap: '',
    lineJoin: '',
    globalAlpha: 1,
    shadowBlur: 0,
    shadowColor: '',
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    clearRect: jest.fn(),
    beginPath: jest.fn(),
    closePath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    createLinearGradient: () => ({
        addColorStop: jest.fn()
    }),
    createRadialGradient: () => ({
        addColorStop: jest.fn()
    })
});

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => {
    return setTimeout(callback, 16);
};

global.cancelAnimationFrame = (id) => {
    clearTimeout(id);
};

// Mock Date.now for consistent timing
const originalDateNow = Date.now;
global.Date.now = jest.fn(() => originalDateNow());
