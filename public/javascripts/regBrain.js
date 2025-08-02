    
        // Add real-time validation feedback
        const inputs = document.querySelectorAll('input[required], select[required], textarea[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.value.trim() === '') {
                    this.classList.add('border-red-300', 'focus:ring-red-500');
                    this.classList.remove('border-gray-300', 'focus:ring-blue-500');
                } else {
                    this.classList.remove('border-red-300', 'focus:ring-red-500');
                    this.classList.add('border-gray-300', 'focus:ring-blue-500');
                }
            });
        });

        // Email validation
        document.getElementById('email').addEventListener('input', function() {
            const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (this.value && !emailReg.test(this.value)) {
                this.classList.add('border-red-300', 'focus:ring-red-500');
                this.classList.remove('border-gray-300', 'focus:ring-blue-500');
            } else if (this.value) {
                this.classList.remove('border-red-300', 'focus:ring-red-500');
                this.classList.add('border-green-300', 'focus:ring-green-500');
            }
        });

        // Landline phone number formatting and validation
        document.getElementById('phone').addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            
            // Limit to 10 digits for landline
            if (value.length > 10) {
                value = value.substring(0, 10);
            }
            
            // Format as landline: (XXX) XXX-XXXX
            if (value.length >= 6) {
                value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
            } else if (value.length >= 3) {
                value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
            }
            
            this.value = value;
            
            // Validate landline format
            const landlinePattern = /^\(\d{3}\) \d{3}-\d{4}$/;
            if (this.value && !landlinePattern.test(this.value)) {
                this.classList.add('border-red-300', 'focus:ring-red-500');
                this.classList.remove('border-gray-300', 'focus:ring-blue-500', 'border-green-300', 'focus:ring-green-500');
            } else if (this.value && landlinePattern.test(this.value)) {
                this.classList.remove('border-red-300', 'focus:ring-red-500');
                this.classList.add('border-green-300', 'focus:ring-green-500');
            }
        });

        // Profile picture upload functionality
        const profilePictureInput = document.getElementById('profilePicture');
        const profilePreview = document.getElementById('profilePreview');
        const uploadArea = document.getElementById('uploadArea');
        const uploadBtn = document.getElementById('uploadBtn');
        const removeBtn = document.getElementById('removeBtn');

        // Handle file selection
        function handleFileSelect(file) {
            if (file && file.type.startsWith('image/')) {
                // Check file size (5MB limit)
                if (file.size > 5 * 1024 * 1024) {
                    alert('File size must be less than 5MB');
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    profilePreview.innerHTML = `<img src="${e.target.result}" alt="Profile Preview" class="w-full h-full object-cover rounded-full">`;
                    removeBtn.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            }
        }

        // Upload button click
        uploadBtn.addEventListener('click', function() {
            profilePictureInput.click();
        });

        // Upload area click
        uploadArea.addEventListener('click', function() {
            profilePictureInput.click();
        });

        // File input change
        profilePictureInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            handleFileSelect(file);
        });

        // Drag and drop functionality
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('border-blue-400', 'bg-blue-50');
        });

        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.classList.remove('border-blue-400', 'bg-blue-50');
        });

        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('border-blue-400', 'bg-blue-50');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                profilePictureInput.files = files;
                handleFileSelect(files[0]);
            }
        });

        // Remove picture
        removeBtn.addEventListener('click', function() {
            profilePictureInput.value = '';
            profilePreview.innerHTML = `
                <svg class="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                </svg>
            `;
            this.classList.add('hidden');
        });
    