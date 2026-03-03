let storeData = [];

function renderStore(filter = 'all', search = '') {
            const container = document.getElementById('contentSections');
            container.innerHTML = '';

            const categories = [
                { id: 'gta', label: 'Grand Theft Auto Series', icon: 'award' },
                { id: 'sports', label: 'Simulação de Esportes', icon: 'dribbble' },
                { id: 'open-world', label: 'Mundo Aberto & Ação', icon: 'compass' },
                { id: 'racing', label: 'Corridas & Velocidade', icon: 'car-front' }
            ];

            const filteredCategories = filter === 'all' ? categories : categories.filter(c => c.id === filter);
            let hasResults = false;

            filteredCategories.forEach(cat => {
                let items = storeData.filter(item => item.type === cat.id);
                if (search) {
                    items = items.filter(item => item.title.toLowerCase().includes(search.toLowerCase()) || item.author.toLowerCase().includes(search.toLowerCase()));
                }

                if (items.length > 0) {
                    hasResults = true;
                    const section = document.createElement('section');
                    section.innerHTML = `
                        <div class="flex items-center justify-between mb-8">
                            <h3 class="text-2xl sm:text-3xl font-black tracking-tighter flex items-center gap-4">
                                <span class="w-2 h-8 bg-blue-600 rounded-full"></span>
                                ${cat.label}
                            </h3>
                            <div class="flex items-center gap-2 text-[#01875f] font-bold cursor-pointer group transition-colors hover:text-[#016f4e]">
                                <span class="hidden sm:inline">Ver catálogo</span>
                                <i data-lucide="arrow-right" class="w-5 h-5 group-hover:translate-x-1 transition-transform"></i>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-10">
                            ${items.map(item => `
                                <div id="card-${item.id}" onclick="openModal(${item.id})" class="group cursor-pointer reveal-item flex flex-col gap-3">
                                    <div class="aspect-[2/3] rounded-2xl overflow-hidden relative shadow-sm group-hover:shadow-lg transition-all bg-gray-200 dark:bg-[#303134]">
                                        <img src="${item.cover}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy">
                                    </div>
                                    <div>
                                        <h4 class="font-bold text-sm text-gray-900 dark:text-gray-100 leading-tight mb-1 truncate">${item.title}</h4>
                                        <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <span class="font-medium">${item.size}</span>
                                            <span class="w-1 h-1 rounded-full bg-gray-400"></span>
                                            <span class="flex items-center gap-1">4.9 <i data-lucide="star" class="w-3 h-3 fill-current"></i></span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                    container.appendChild(section);
                }
            });

            if (!hasResults) {
                container.innerHTML = `<div class="py-16 sm:py-32 text-center opacity-50 flex flex-col items-center"><i data-lucide="search-x" class="w-12 h-12 sm:w-16 sm:h-16 mb-4"></i><p class="text-lg sm:text-xl font-bold">Nenhum resultado encontrado...</p><p class="text-sm text-gray-400 dark:text-gray-500 mt-2">Tente ajustar sua busca ou filtro.</p></div>`;
            }
            lucide.createIcons();
            observeItems();
        }

        function observeItems() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        entry.target.style.transitionDelay = `${index * 50}ms`;
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            const items = document.querySelectorAll('.reveal-item');
            items.forEach(item => observer.observe(item));
        }

        function filterCategory(id) {
            document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.category-pill').forEach(p => p.classList.add('border-gray-200', 'dark:border-gray-700', 'hover:bg-gray-50', 'dark:hover:bg-[#303134]'));
            
            document.getElementById(`tab-${id}`).classList.add('active');
            document.getElementById(`tab-${id}`).classList.remove('border-gray-200', 'dark:border-gray-700', 'hover:bg-gray-50', 'dark:hover:bg-[#303134]');
            renderStore(id, document.getElementById('searchInput').value);
        }

        const modal = document.getElementById('itemModal');
        function openModal(id) {
            const item = storeData.find(i => i.id === id);
            if (!item) return;

            document.getElementById('modalTitle').innerText = item.title;
            document.getElementById('modalAuthor').innerText = item.author;
            document.getElementById('modalSize').innerText = item.size;
            document.getElementById('modalRepack').innerText = item.author.split(' ')[0];
            
            const modalDesc = document.getElementById('modalDesc');
            fetchWikipediaDescription(item.title, modalDesc);

            // Set requirements
            const reqs = item.requirements || {};
            document.getElementById('req-os').innerHTML = `<strong class="block text-gray-400 uppercase text-[10px] font-black">Sistema Operacional</strong> ${reqs.os || 'Não especificado'}`;
            document.getElementById('req-processor').innerHTML = `<strong class="block text-gray-400 uppercase text-[10px] font-black">Processador</strong> ${reqs.processor || 'Não especificado'}`;
            document.getElementById('req-memory').innerHTML = `<strong class="block text-gray-400 uppercase text-[10px] font-black">Memória</strong> ${reqs.memory || 'Não especificado'}`;
            document.getElementById('req-graphics').innerHTML = `<strong class="block text-gray-400 uppercase text-[10px] font-black">Gráficos</strong> ${reqs.graphics || 'Não especificado'}`;
            document.getElementById('req-storage').innerHTML = `<strong class="block text-gray-400 uppercase text-[10px] font-black">Armazenamento</strong> ${reqs.storage || 'Não especificado'}`;

            const torrentPath = item.torrent;
            const downloadButton = document.getElementById('modalDownloadLink');
            downloadButton.href = torrentPath;

            // --- Logic for Copy Button ---
            const copyButton = document.getElementById('copyMagnetLink');
            // Clone and replace to remove old event listeners
            const newCopyButton = copyButton.cloneNode(true);
            
            // Reset button state (remove success classes and reset text)
            newCopyButton.classList.remove('bg-green-200', 'dark:bg-green-900');
            const copyButtonText = newCopyButton.querySelector('span');
            copyButtonText.innerText = 'COPIAR LINK';

            copyButton.parentNode.replaceChild(newCopyButton, copyButton);

            newCopyButton.addEventListener('click', () => {
                if (!navigator.clipboard) {
                    copyButtonText.innerText = 'HTTPS NECESSÁRIO';
                    return;
                }
                navigator.clipboard.writeText(torrentPath).then(() => {
                    copyButtonText.innerText = 'COPIADO!';
                    newCopyButton.classList.add('bg-green-200', 'dark:bg-green-900');
                    setTimeout(() => {
                        copyButtonText.innerText = 'COPIAR LINK';
                        newCopyButton.classList.remove('bg-green-200', 'dark:bg-green-900');
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                    copyButtonText.innerText = 'FALHA AO COPIAR';
                     setTimeout(() => {
                        copyButtonText.innerText = 'COPIAR LINK';
                    }, 2000);
                });
            });
            // --- End of Logic for Copy Button ---
            
            const iconBox = document.getElementById('modalIcon');
            iconBox.className = `w-48 h-48 sm:w-56 sm:h-56 md:w-72 md:h-72 rounded-3xl shadow-lg mx-auto md:mx-0 flex items-center justify-center text-white relative z-10 bg-gradient-to-br ${item.color} overflow-hidden`;
            iconBox.innerHTML = `<img src="${item.cover}" alt="${item.title}" class="w-full h-full object-cover">`;

            const videoWrapper = document.getElementById('videoWrapper');
            const imageFallback = document.getElementById('imageFallback');
            
            if (item.video) {
                videoWrapper.classList.remove('hidden');
                imageFallback.classList.add('hidden');
                videoWrapper.innerHTML = `<iframe src="https://www.youtube.com/embed/${item.video}?autoplay=1&mute=1&loop=1&playlist=${item.video}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
            } else {
                videoWrapper.classList.add('hidden');
                imageFallback.classList.remove('hidden');
                imageFallback.className = `h-64 md:h-96 flex items-center justify-center text-white bg-gradient-to-br ${item.color} opacity-40`;
            }
            
            modal.classList.remove('hidden');
            // Force a reflow before adding the class to trigger the transition
            void modal.offsetWidth;
            modal.classList.add('is-open');
            document.body.style.overflow = 'hidden';
            lucide.createIcons();
        }

        async function fetchWikipediaDescription(title, element) {
            element.innerText = 'Carregando descrição da Wikipédia...';
            const endpoint = `https://pt.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=true&explaintext=true&redirects=1&origin=*&titles=${encodeURIComponent(title)}`;

            try {
                const response = await fetch(endpoint);
                const data = await response.json();
                const pages = data.query.pages;
                const pageId = Object.keys(pages)[0];

                if (pageId === '-1' || !pages[pageId].extract) {
                    element.innerText = 'Não foi possível encontrar uma descrição para este jogo na Wikipédia em português. A descrição pode estar indisponível ou o título pode não corresponder exatamente.';
                } else {
                    element.innerText = pages[pageId].extract;
                }
            } catch (error) {
                console.error('Error fetching Wikipedia data:', error);
                element.innerText = 'Falha ao carregar a descrição. Verifique sua conexão com a internet.';
            }
        }

        async function fetchWikiImage(title) {
            // Tenta primeiro na Wikipédia em Português
            const ptEndpoint = `https://pt.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&titles=${encodeURIComponent(title)}&pithumbsize=600&redirects=1&origin=*`;
            
            try {
                let response = await fetch(ptEndpoint);
                let data = await response.json();
                let pages = data.query.pages;
                let pageId = Object.keys(pages)[0];

                if (pageId !== '-1' && pages[pageId].thumbnail) {
                    return pages[pageId].thumbnail.source;
                }

                // Se falhar, tenta na Wikipédia em Inglês
                const enEndpoint = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&titles=${encodeURIComponent(title)}&pithumbsize=600&redirects=1&origin=*`;
                response = await fetch(enEndpoint);
                data = await response.json();
                pages = data.query.pages;
                pageId = Object.keys(pages)[0];

                if (pageId !== '-1' && pages[pageId].thumbnail) {
                    return pages[pageId].thumbnail.source;
                }
            } catch (error) {
                console.error(`Erro ao buscar capa para ${title}:`, error);
            }
            return null;
        }

        function closeModal() {
            modal.classList.remove('is-open');
            
            const onTransitionEnd = () => {
                modal.classList.add('hidden');
                document.getElementById('videoWrapper').innerHTML = ''; // Stop video
                document.body.style.overflow = 'auto';
                modal.removeEventListener('transitionend', onTransitionEnd);
            };
            modal.addEventListener('transitionend', onTransitionEnd);
        }

        function toggleTheme() {
            const html = document.documentElement;
            const icon = document.getElementById('themeIcon');
            
            if (html.classList.contains('dark')) {
                html.classList.remove('dark');
                localStorage.setItem('theme', 'light');
                icon.setAttribute('data-lucide', 'moon');
            } else {
                html.classList.add('dark');
                localStorage.setItem('theme', 'dark');
                icon.setAttribute('data-lucide', 'sun');
            }
            lucide.createIcons();
        }

        document.getElementById('searchInput').addEventListener('input', (e) => {
            const activeTab = document.querySelector('.category-pill.active').id.replace('tab-', '');
            renderStore(activeTab, e.target.value);
        });
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

        window.onload = async () => {
            // Initialize Theme
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
                document.getElementById('themeIcon').setAttribute('data-lucide', 'sun');
            }

            try {
                // Caminho ajustado: sobe um nível (..) para sair da pasta HTML e entra na pasta JS
                const response = await fetch('DataStore.json');
                storeData = await response.json();
                renderStore();
                // setupCarousel(); // Esta função não está definida neste arquivo e pode estar causando um erro.
                
                // Atualiza as capas via API
                storeData.forEach(async (item) => {
                    if (item.lockCover) return;
                    const wikiCover = await fetchWikiImage(item.title);
                    if (wikiCover) {
                        item.cover = wikiCover;
                        const cardEl = document.getElementById(`card-${item.id}`);
                        if (cardEl) {
                            cardEl.querySelector('img').src = wikiCover;
                        }
                    }
                });
            } catch (error) {
                console.error("Erro ao carregar DataStore:", error);
                document.getElementById('contentSections').innerHTML = '<div class="text-center py-20 text-red-500 font-bold">Erro ao carregar catálogo de jogos.</div>';
            }
            lucide.createIcons();
        };