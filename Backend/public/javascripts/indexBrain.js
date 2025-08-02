
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });





        // Profile dropdown functionality
        const profileDropdown = document.getElementById('profileDropdown');
        const profileMenu = document.getElementById('profileMenu');

        function toggleProfileMenu() {
            profileMenu.classList.toggle('hidden');
        }

        function closeProfileMenu() {
            profileMenu.classList.add('hidden');
        }

        // Event listeners
        profileDropdown.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleProfileMenu();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function (e) {
            if (!profileDropdown.contains(e.target) && !profileMenu.contains(e.target)) {
                closeProfileMenu();
            }
        });




