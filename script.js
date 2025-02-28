
    // DELETE const app = new Realm.App({ id: "nanofabrication-1-qrqzqui" }); // Replace with your MongoDB Realm App ID
    let user = null;
	document.addEventListener("DOMContentLoaded", function () {
		const saveButton = document.getElementById("floating-save-button");
		
		// Show button only when there's user interaction
		document.getElementById("logsheet-container").addEventListener("input", function () {
			saveButton.style.display = "block";
		});
	});
	
	/* DELETE
    async function authenticateAnonymously() {
        try {
            const credentials = Realm.Credentials.anonymous();
            user = await app.logIn(credentials);
            console.log("Authenticated anonymously:", user);
        } catch (error) {
            console.error("Failed to authenticate anonymously:", error);
            return null;
        }
    }*/

    function newLogsheet() {
        document.getElementById('logsheet-title').value = '';
        document.getElementById('logsheet-author').value = '';
        document.getElementById('created-at').value = '';
        document.getElementById('modified-at').value = '';
        document.getElementById('items-container').innerHTML = '';
		document.getElementById('logsheet-id').value = '';
    }
	
	// Function to automatically adjust the height of the textarea
	function autoResizeTextarea(element) {
		element.style.height = 'auto'; // Reset height to auto to recalculate
		element.style.height = element.scrollHeight + 'px'; // Set height to match the content
	}


    function openLoadModal() {
        document.getElementById('loadModal').style.display = 'block';
        loadLogsheetTitles();
    }

    function closeLoadModal() {
        document.getElementById('loadModal').style.display = 'none';
    }

    async function loadLogsheetTitles() {
        try {
            // DELETE const response = await app.currentUser.functions.getAllLogsheetTitles();
			const response = await fetch(`/api/getAllLogsheetTitles`, {
				method: "GET",
				headers: { "Accept": "application/json" }
			});
			
            const logsheetList = document.getElementById('logsheet-list');
            logsheetList.innerHTML = '';
			const jsonData = await response.json();
            if (jsonData.success && jsonData.data.length > 0) {
                jsonData.data.forEach(title => {
                    const li = document.createElement('li');
                    li.textContent = title;
                    li.onclick = () => {
                        selectLogsheet(title);
                        closeLoadModal();
                    };
                    logsheetList.appendChild(li);
                });
            } else {
                logsheetList.innerHTML = '<li>No logsheets found</li>';
            }
        } catch (error) {
            console.error("Failed to load logsheet titles:", error.message);
        }
    }

    function filterLogsheets() {
        const filter = document.getElementById('search-logsheets').value.toUpperCase();
        const logsheetList = document.getElementById('logsheet-list');
        const items = logsheetList.getElementsByTagName('li');

        for (let i = 0; i < items.length; i++) {
            const txtValue = items[i].textContent || items[i].innerText;
            items[i].style.display = txtValue.toUpperCase().indexOf(filter) > -1 ? "" : "none";
        }
    }

    async function selectLogsheet(title) {
        try {
            // DELETE const response = await app.currentUser.functions.getLogsheetByTitle(title);
			const response = await fetch(`/api/getLogsheetByTitle?title=${encodeURIComponent(title)}`, {
				method: "GET",
				headers: { "Accept": "application/json" }
			});
			const jsonData = await response.json();
            if (jsonData.success) {
                editLogsheet(jsonData);
            } else {
                console.error("Failed to load logsheet:", jsonData.error);
            }
        } catch (error) {
            console.error("Error selecting logsheet:", error.message);
        }
    }

    function addLogsheetStep() {
        const itemsContainer = document.getElementById('items-container');
        const logsheetStep = document.createElement('div');
        logsheetStep.className = 'logsheet-step';

        const timestamp = new Date().toLocaleString();

        logsheetStep.innerHTML = `
            <div class="tag step-tag">Procedure</div>
			<input type="hidden" name="step-id" value="">
			<button class="remove-item" onclick="this.parentElement.remove()">X</button>
            
            <label>Title</label>
            <input class="logsheet-step-title" type="text" placeholder="Enter step title" style="text-align:center;">
            
            <label>Description</label>
            <textarea rows="2" placeholder="Enter detailed step description"></textarea>
            
            <label>Procedures</label>
            <textarea rows="3" placeholder="Enter procedures" class="textbox-lines"></textarea>

            <label>Author</label>
            <input type="text" placeholder="Enter author name">

            <label>Timestamp</label>
            <input type="text" class="step-timestamp" placeholder="Timestamp" value="${timestamp}" readonly>

            <button onclick="saveToTemplate(this)">Save to Template</button>
            <button onclick="loadFromTemplate(this)">Load from Template</button>
        `;
        itemsContainer.appendChild(logsheetStep);
		document.querySelectorAll('textarea').forEach(textarea => {
			textarea.addEventListener('input', function() {
				autoResizeTextarea(this);
			});
		});
    }

    function addNote() {
        const itemsContainer = document.getElementById('items-container');
        const noteItem = document.createElement('div');
        noteItem.className = 'logsheet-step';
		const timestamp = new Date().toLocaleString();
        noteItem.innerHTML = `
            <div class="tag step-tag">Note</div>
			<button class="remove-item" onclick="this.parentElement.remove()">X</button>
            
            <label>Note Content</label>
            <textarea rows="3" placeholder="Enter note content"></textarea>
			<label>Timestamp</label>
            <input type="text" class="step-timestamp" placeholder="Timestamp" value="${timestamp}" readonly>
        `;
        itemsContainer.appendChild(noteItem);
    }

    function addAttachment() {
        const itemsContainer = document.getElementById('items-container');
        const attachmentItem = document.createElement('div');
        attachmentItem.className = 'logsheet-step';
		const fileObjectId = "";  // Initially, no file is uploaded
		const timestamp = new Date().toLocaleString();
        attachmentItem.innerHTML = `
            <div class="tag step-tag">Attachement</div>
			<button class="remove-item" onclick="this.parentElement.remove()">X</button>
            
            <label>Attachment</label>
            <input type="file" onchange="updateFileName(this)">
            <span class="file-name">No file selected</span>

            <label>Description</label>
            <textarea rows="2" placeholder="Enter attachment description"></textarea>

            <button onclick="uploadAttachment(this)">Upload</button>
			<label>Timestamp</label>
            <input type="text" class="step-timestamp" placeholder="Timestamp" value="${timestamp}" readonly>
			<input type="hidden" name="file-id" value="${fileObjectId}"> <!-- Store ObjectId here -->
			<a class="download-link" style="display:none;">Download</a> <!-- Download link -->
        `;
        itemsContainer.appendChild(attachmentItem);
    }

    function updateFileName(input) {
        const fileNameIndicator = input.nextElementSibling;
        const file = input.files[0];
        fileNameIndicator.textContent = file ? `File: ${file.name}` : "No file selected";
    }

    
	async function saveToTemplate(button) {
    // Find the parent element (the item where the button is located)
    const parentItem = button.parentElement;

    // Extract the relevant data from the parent item (logsheet step or note)
    const title = parentItem.querySelector('input[placeholder="Enter step title"]')?.value || '';
    const description = parentItem.querySelector('textarea[placeholder="Enter detailed step description"]')?.value || '';
    const procedures = parentItem.querySelector('textarea[placeholder="Enter procedures"]')?.value || '';

    // Create the template object
    const template = {
        title: title,
        description: description,
        procedures: procedures,
        createdAt: new Date().toISOString() // You can add a timestamp for when the template is saved
    };

    // Call the backend to save the template
    try {
        // DELETE const response = await app.currentUser.functions.saveTemplate(template);
		const response = await fetch("/api/saveTemplate", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(template)
		});
		const jsonData = await response.json();
        if (jsonData.success) {
            alert("Template saved successfully!");
        } else {
            console.error("Failed to save template:", jsonData.error);
            alert("Failed to save template: " + jsonData.error);
        }
    } catch (error) {
        console.error("Error saving template:", error.message);
        alert("Error saving template: " + error.message);
    }
}


async function readSmallFile(file, filename) {
    // Convert the file to base64 (this will also handle binary data)
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onloadend = async function() {
            const base64Data = reader.result.split(",")[1]; // Strip the base64 metadata
            resolve({ base64Data, filename });
        };

        reader.onerror = reject;
        reader.readAsDataURL(file); // Read the file as base64 data URL
    });
}



	
	async function uploadAttachment(button) {
        const attachmentItem = button.parentElement;
        const fileInput = attachmentItem.querySelector('input[type="file"]');
        const file = fileInput.files[0];
		//const filename = fileInput.files[0].name;
		

        if (!file) {
            alert("Please select a file before uploading.");
            return;
        }
		const { base64Data, filename } = await readSmallFile(file, file.name);
		const fileNameIndicator = attachmentItem.querySelector('.file-name');
        try {
			// DELETE const response = await app.currentUser.functions.upload(base64Data, filename);
			const response = await fetch("/api/upload", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: {
					"base64Data":base64Data,
					"filename":filename
				}
			});
			const jsonData = await response.json();
			if (jsonData.success) {
				fileNameIndicator.textContent = `File: ${file.name} (Uploaded)`;
				attachmentItem.querySelector('input[name=file-id]').value=jsonData.fileId;
			} else {
				console.error("Uploading attachment failed:", jsonData.error);
				fileNameIndicator.textContent = "Upload failed";
			}
		} catch (error) {
			console.error("Error uploading file:", error.message);
			alert("Error uploading file: " + error.message);
		}
        
    }
	


async function downloadAttachment(fileId) {
    try {
        // Call the MongoDB App Services function to get the file data
        // DELETE const response = await app.currentUser.functions.download(fileId);
		const response = await fetch(`/api/download?fileId=${encodeURIComponent(fileId)}`, {
			method: "GET",
			headers: { "Accept": "application/octet-stream" }
		});
		const jsonData = await response.json();
        if (jsonData.success) {
            // Create a downloadable link using the base64 data
            const a = document.createElement("a");
            const base64Data = jsonData.fileData;
            const contentType = jsonData.contentType || "application/octet-stream";
            const fileName = jsonData.fileName;

            // Construct the href for the download link
            a.href = `data:${contentType};base64,${base64Data}`;
            a.download = fileName;

            // Trigger the download by programmatically clicking the link
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            alert("Failed to download file: " + jsonData.error);
        }
    } catch (error) {
        console.error("Error downloading file:", error.message);
        alert("Error downloading file: " + error.message);
    }
}


    async function saveLogsheet() {
        const title = document.getElementById('logsheet-title').value;
        const author = document.getElementById('logsheet-author').value;
		const logsheetId = document.getElementById('logsheet-id').value;

        let createdAt = document.getElementById('created-at').value;
        const modifiedAt = new Date().toLocaleString();

        if (!createdAt) {
            createdAt = modifiedAt;
        }

        const items = Array.from(document.querySelectorAll('.logsheet-step')).map(item => {
            

            if (item.querySelector('textarea')) {
                if (item.querySelector('textarea[placeholder="Enter note content"]')) {
                    return {
                        type: 'note',
                        content: item.querySelector('textarea').value,
						timestamp: item.querySelector('input[placeholder="Timestamp"]').value
                    };
                } else if (item.querySelector('input[type="file"]')) {
					const fileObjectId = item.querySelector('input[name="file-id"]').value; // Get the ObjectId from the hidden input field
					const fileNameIndicator = item.querySelector('.file-name').textContent;
					const description = item.querySelector('textarea[placeholder="Enter attachment description"]').value;

					return {
						type: 'attachment',
						attachment_name: fileNameIndicator.replace('File: ', '').replace(' (Uploaded)', ''),
						description: description,
						fileObjectId: fileObjectId, // Save the fileObjectId for this attachment
						timestamp: item.querySelector('input[placeholder="Timestamp"]').value
					};
				
                } else {
                    return {
                        type: 'step',
                        title: item.querySelector('input[placeholder="Enter step title"]').value,
                        description: item.querySelector('textarea[placeholder="Enter detailed step description"]').value,
                        procedures: item.querySelector('textarea[placeholder="Enter procedures"]').value,
                        //author: item.querySelector('input[placeholder="Enter author name"]').value,
                        timestamp: item.querySelector('input[placeholder="Timestamp"]').value
                    };
                }
            }
        });

        const logsheet = {
            _id: logsheetId,
			title,
            author,
            created_at: createdAt,
            last_modified_at: modifiedAt,
            items
        };

        // DELETE const response = await app.currentUser.functions.saveLogsheet(logsheet);
		const response = await fetch("/api/saveLogsheet", {
			method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(logsheet)
			});
		const jsonData = await response.json();
        if (jsonData.success) {
            document.getElementById('logsheet-id').value = jsonData.objectId.toString();
			alert("Saved!");
        } else {
            console.error("Saving logsheet failed:", jsonData.error);
			alert("Saving failed!", jsonData.error);
        }
    }

    async function deleteLogsheet() {
        const logsheetId = document.getElementById('logsheet-id').value;
		// DELETE const response = await app.currentUser.functions.deleteLogsheet(logsheetId);
		const response = await fetch(`/api/deleteLogsheetById?id=${encodeURIComponent(logsheetId)}`, {
			method: "DELETE"
		});
        if (response) {
            alert("deleted!");
        } else {
            console.error("Deleting logsheet failed:", jsonData.error);
        }
    }
/* DELETE
    async function loadLogsheets() {
        const response = await app.currentUser.functions.getLogsheets();
        const logsheetContainer = document.getElementById('logsheet-container');
        logsheetContainer.innerHTML = '';

        if (jsonData.success) {
            jsonData.logsheets.forEach(logsheet => {
                const logsheetItem = document.createElement('div');
                logsheetItem.className = 'item';
                logsheetItem.innerHTML = `
                    <h3>${logsheet.title}</h3>
                    <p>Items: ${logsheet.items.map(item => {
                        if (item.type === 'step') {
                            return item.title || 'Step';
                        } else if (item.type === 'note') {
                            return item.note || 'Note';
                        } else if (item.type === 'attachment') {
                            return item.attachment_name || 'Attachment';
                        }
                    }).join(', ')}</p>
                    <button class="btn" onclick="editLogsheet('${logsheet._id}')">Edit</button>
                    <button class="btn-danger" onclick="deleteLogsheet('${logsheet._id}')">Delete</button>
                `;
                logsheetContainer.appendChild(logsheetItem);
            });
        } else {
            console.error("Fetching logsheets failed:", jsonData.error);
        }
    }
*/
    async function editLogsheet(logsheet) {
        try {
            //const response = await app.currentUser.functions.getLogsheet(logsheetId);

            document.getElementById('logsheet-title').value = logsheet.title || '';
            document.getElementById('logsheet-author').value = logsheet.author || '';
            document.getElementById('created-at').value = logsheet.created_at || '';
            document.getElementById('modified-at').value = logsheet.last_modified_at || '';
			document.getElementById('logsheet-id').value = logsheet._id.toString();

            document.getElementById('items-container').innerHTML = '';

            logsheet.items.forEach(item => {
                if (item.type === 'step') {
                    addLogsheetStep();
                    const stepElement = document.getElementById('items-container').lastElementChild;

                    stepElement.querySelector('input[placeholder="Enter step title"]').value = item.title || '';
                    stepElement.querySelector('textarea[placeholder="Enter detailed step description"]').value = item.description || '';
                    stepElement.querySelector('textarea[placeholder="Enter procedures"]').value = item.procedures || '';
                    //stepElement.querySelector('input[placeholder="Enter author name"]').value = item.author || '';
                    stepElement.querySelector('.step-timestamp').value = item.timestamp || '';
					autoResizeTextarea(stepElement.querySelector('textarea[placeholder="Enter procedures"]'));
					
					

                } else if (item.type === 'note') {
                    addNote();
                    const noteElement = document.getElementById('items-container').lastElementChild;
                    noteElement.querySelector('textarea[placeholder="Enter note content"]').value = item.content || '';
					noteElement.querySelector('.step-timestamp').value = item.timestamp || '';

                } else if (item.type === 'attachment') {
                    addAttachment();
                    const attachmentElement = document.getElementById('items-container').lastElementChild;
                    attachmentElement.querySelector('.file-name').textContent = item.attachment_name || 'No file selected';
                    attachmentElement.querySelector('textarea[placeholder="Enter attachment description"]').value = item.description || '';
					attachmentElement.querySelector('.step-timestamp').value = item.timestamp || '';
					                // Set ObjectId in the hidden field
					attachmentElement.querySelector('input[name="file-id"]').value = item.fileObjectId || '';

					// Show download link if there is an ObjectId
					const downloadLink = attachmentElement.querySelector('.download-link');
					if (item.fileObjectId) {
						downloadLink.style.display = 'inline';
						downloadLink.href = '#'; // Assign a placeholder link, will be updated dynamically
						downloadLink.textContent = 'Download';
						downloadLink.onclick = () => downloadAttachment(item.fileObjectId);
						attachmentElement.querySelector('input[type="file"]').style.display = 'none';
						attachmentElement.querySelector('button[onclick="uploadAttachment(this)"]').style.display = 'none';
					}
                }
            });
        } catch (error) {
            console.error("Failed to load logsheet for editing:", error.message);
            alert("Failed to load logsheet for editing: " + error.message);
        }
    }

    window.onload = async function() {
		/* DELETE
	   await authenticateAnonymously();
        if (user) {
            console.log("User ID:", user.id);
            //loadLogsheets();
        }*/
    }
/* DELETE
    async function searchLogsheets() {
        const title = document.getElementById('search-title').value.trim();

        if (title === '') {
            alert("Please enter a title to search.");
            return;
        }
        try {
            const response = await app.currentUser.functions.searchLogsheetsByTitle(title);
            const logsheetContainer = document.getElementById('logsheet-container');
            logsheetContainer.innerHTML = '';

            if (response.success) {
                if (response.logsheets.length > 0) {
                    response.logsheets.forEach(logsheet => {
                        const logsheetItem = document.createElement('div');
                        logsheetItem.className = 'item';
                        logsheetItem.innerHTML = `
                            <h3>${logsheet.name}</h3>
                            <p>Items: ${logsheet.items.map(item => {
                                if (item.type === 'step') {
                                    return item.title || 'Step';
                                } else if (item.type === 'note') {
                                    return item.note || 'Note';
                                } else if (item.type === 'attachment') {
                                    return item.attachment_name || 'Attachment';
                                }
                            }).join(', ')}</p>
                            <button class="btn" onclick="editLogsheet('${logsheet._id}')">Edit</button>
                            <button class="btn-danger" onclick="deleteLogsheet('${logsheet._id}')">Delete</button>
                        `;
                        logsheetContainer.appendChild(logsheetItem);
                    });
                } else {
                    logsheetContainer.innerHTML = '<p>No logsheets found.</p>';
                }
            } else {
                console.error("Fetching logsheets failed:", response.to);
            }
        } catch (error) {
            console.error("Try Fetching logsheets failed:", error);
            return { error: error.toString() };
        }
    }
	*/
	
	async function loadFromTemplate(button) {
    // Store the button's parent element to populate later when the user selects a template
    window.templateTargetItem = button.parentElement;
    
    // Open the modal and load the templates
    openTemplateModal();
}

function openTemplateModal() {
    document.getElementById('templateModal').style.display = 'block';
    
    // Load the list of templates
    loadTemplateTitles();
}

function closeTemplateModal() {
    document.getElementById('templateModal').style.display = 'none';
}

async function loadTemplateTitles() {
    try {
        // Fetch the list of template titles from the backend
        // DELETE const response = await app.currentUser.functions.getAllTemplateTitles();
		const response = await fetch(`/api/getAllTemplateTitles`, {
			method: "GET",
			headers: { "Accept": "application/json" }
		});
        const templateList = document.getElementById('template-list');
        templateList.innerHTML = ''; // Clear any existing templates
		const jsonData = await response.json();
        if (jsonData.success && jsonData.data.length > 0) {
            // Populate the template list with the fetched titles
            jsonData.data.forEach(title => {
                const li = document.createElement('li');
				li.innerHTML = `
                <span onclick="selectTemplate('${title}')">${title}</span> 
                <button class="delete-template" onclick="deleteTemplate('${title}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
				`;
				li.className = "template-item";
                templateList.appendChild(li);
            });
        } else {
            templateList.innerHTML = '<li>No templates found</li>';
        }
    } catch (error) {
        console.error("Failed to load template titles:", error.message);
    }
}

function filterTemplates() {
    const filter = document.getElementById('search-templates').value.toUpperCase();
    const templateList = document.getElementById('template-list');
    const items = templateList.getElementsByTagName('li');

    for (let i = 0; i < items.length; i++) {
        const txtValue = items[i].textContent || items[i].innerText;
        items[i].style.display = txtValue.toUpperCase().indexOf(filter) > -1 ? "" : "none";
    }
}

async function selectTemplate(title) {
    // Fetch the template by its title
    try {
        // DELETE const response = await app.currentUser.functions.getTemplateByTitle(title);
		
		
		const response = await fetch(`/api/getTemplateByTitle?title=${encodeURIComponent(title)}`, {
			method: "GET",
			headers: { "Accept": "application/json" }
		});

		const jsonData = await response.json();
        if (jsonData.success && jsonData.data) {
            const template = jsonData.data;

            // Populate the form fields in the target logsheet step
            const parentItem = window.templateTargetItem;
            parentItem.querySelector('input[placeholder="Enter step title"]').value = template.title || '';
            parentItem.querySelector('textarea[placeholder="Enter detailed step description"]').value = template.description || '';
            parentItem.querySelector('textarea[placeholder="Enter procedures"]').value = template.procedures || '';
			autoResizeTextarea(parentItem.querySelector('textarea[placeholder="Enter procedures"]'));

            alert("Template loaded successfully!");
            closeTemplateModal();
        } else {
            alert("Template not found or an error occurred: " + jsonData.error);
        }
    } catch (error) {
        console.error("Error loading template:", error.message);
        alert("Failed to load template: " + error.message);
    }
}

async function deleteTemplate(title) {
    if (!confirm(`Are you sure you want to delete template "${title}"?`)) return;

    try {
        // DELETE const response = await app.currentUser.functions.deleteTemplateByTitle(title); // Call backend function
		 const response = await fetch(`/api/deleteTemplateByTitle?title=${encodeURIComponent(title)}`, {
			method: "DELETE"
		});
		const jsonData = await response.json();
        if (jsonData.success) {
            alert("Template deleted successfully!");
            loadTemplateTitles(); // Refresh template list after deletion
        } else {
            alert("Failed to delete template: " + jsonData.error);
        }
    } catch (error) {
        console.error("Error deleting template:", error);
        alert("An error occurred while deleting the template.");
    }
}

