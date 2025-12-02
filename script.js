document.addEventListener('DOMContentLoaded', () => {
    const nftUpload = document.getElementById('nft-upload');
    const bgSelect = document.getElementById('bg-select');
    const canvas = document.getElementById('compositor-canvas');
    const ctx = canvas.getContext('2d');
    // const downloadBtn = document.getElementById('download-btn'); // REMOVED
    const messageBox = document.getElementById('message-box');

    let nftImage = null;
    const DEFAULT_SIZE = 500; // Standard size for the output image

    // --- Configuration for Backgrounds ---
    // The 'path' property uses relative URLs pointing to the images in the 'backgrounds' folder.
    const backgrounds = [
        { id: 'snowflakes', name: 'Falling Snowflakes', path: './backgrounds/snowflakes.jpg' },
        { id: 'fireplace', name: 'Cozy Fireplace', path: './backgrounds/fireplace.jpg' },
        { id: 'tree', name: 'Christmas Tree Lights', path: './backgrounds/tree_lights.jpg' },
        { id: 'abstract', name: 'Abstract Holiday Gold', path: './backgrounds/holiday_gold.jpg' }
    ];

    // Function to display messages to the user
    function showMessage(text, type = 'info') { // type can be 'info', 'success', 'error'
        messageBox.textContent = text;
        messageBox.className = `message-box ${type}`;
        messageBox.classList.remove('hidden');
    }

    // Function to draw the final composite image
    function drawComposite() {
        const selectedBgId = bgSelect.value;
        // downloadBtn.disabled = true; // REMOVED

        if (!nftImage) {
            showMessage("Please upload your NFT image first.", 'info');
            return;
        }

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!selectedBgId) {
            // If no background selected, draw NFT on a white canvas for preview
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawNftAsset(nftImage);
            showMessage("Select a Christmas background to finalize the image.", 'info');
            return;
        }

        showMessage("Loading background and compositing image...", 'info');

        // Find the selected background configuration
        const bgConfig = backgrounds.find(b => b.id === selectedBgId);

        if (!bgConfig) {
            showMessage("Invalid background selection.", 'error');
            return;
        }

        const backgroundImage = new Image();
        backgroundImage.crossOrigin = "Anonymous"; 
        
        backgroundImage.onload = () => {
            // 1. Draw the selected background onto the canvas
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

            // 2. Draw the NFT asset on top
            drawNftAsset(nftImage);

            // New success message instructing manual save
            showMessage("Image successfully composited! Right-click or long-press the finished image above to save it.", 'success');
            // downloadBtn.disabled = false; // REMOVED
        };

        backgroundImage.onerror = () => {
            showMessage(`Error loading background: ${bgConfig.name}. Please ensure the file exists at: ${bgConfig.path}`, 'error');
        };

        // Load the image using the relative path
        backgroundImage.src = bgConfig.path; 
    }

    // Helper function to draw the NFT asset, ensuring it's centered and fits
    function drawNftAsset(img) {
        // Determine the maximum size the NFT can take while maintaining aspect ratio
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const drawFactor = 0.8; // Scale it down slightly (80%) for padding/frame effect
        const drawWidth = img.width * scale * drawFactor; 
        const drawHeight = img.height * scale * drawFactor;
        
        // Calculate position to center the image
        const x = (canvas.width - drawWidth) / 2;
        const y = (canvas.height - drawHeight) / 2;

        ctx.drawImage(img, x, y, drawWidth, drawHeight);
    }

    // --- Initialization and Event Listeners ---

    // Populate the dropdown menu
    function populateDropdown() {
        backgrounds.forEach(bg => {
            const option = document.createElement('option');
            option.value = bg.id;
            option.textContent = bg.name;
            bgSelect.appendChild(option);
        });
    }
    populateDropdown();

    // 1. Handle NFT Image Upload
    nftUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                nftImage = img;
                
                // Set canvas dimensions to the standard size
                canvas.width = DEFAULT_SIZE;
                canvas.height = DEFAULT_SIZE;
                
                // Trigger the composite process
                drawComposite();
            };
            img.onerror = () => {
                showMessage("Could not load the image file. Ensure it is a valid image.", 'error');
                nftImage = null;
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    // 2. Handle Background Selection Change
    bgSelect.addEventListener('change', drawComposite);

    // 3. Handle Download - LOGIC REMOVED
    
    // Initial message
    showMessage("Upload your NFT image (PNG with a transparent background is best) to begin.", 'info');
});

