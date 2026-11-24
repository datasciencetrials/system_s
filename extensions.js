// --- NEW DASHBOARD EXTENSIONS ---

function initPhotosTab() {
  if (window.__photosInitialized) return;
  window.__photosInitialized = true;
  
  const listContainer = document.getElementById('photoStructureList');
  const galleryContainer = document.getElementById('photoGallery');
  const searchInput = document.getElementById('photoSearch');
  
  if (typeof PHOTOS_DATA === 'undefined' || !PHOTOS_DATA) {
     galleryContainer.innerHTML = '<div class="empty-state"><p>No photos data loaded.</p></div>';
     return;
  }
  
  const ids = Object.keys(PHOTOS_DATA).sort();
  
  function renderList(filterText = '') {
      listContainer.innerHTML = '';
      const text = filterText.toLowerCase();
      
      const filtered = ids.filter(id => id.toLowerCase().includes(text));
      
      filtered.forEach(id => {
          const btn = document.createElement('button');
          btn.className = 'btn btn-outline';
          btn.style.width = '100%';
          btn.style.textAlign = 'left';
          btn.style.marginBottom = '4px';
          btn.style.borderColor = '#E2E8F0';
          btn.style.color = '#0F172A';
          btn.style.background = '#FFFFFF';
          btn.innerText = 'Structure ' + id;
          btn.onclick = () => {
              // Highlight selected
              Array.from(listContainer.children).forEach(c => {
                  c.style.borderColor = '#E2E8F0';
                  c.style.background = '#FFFFFF';
              });
              btn.style.borderColor = '#0071E3';
              btn.style.background = '#EFF6FF';
              
              // Render photos
              galleryContainer.innerHTML = '';
              const photos = PHOTOS_DATA[id];
              if (photos.length === 0) {
                 galleryContainer.innerHTML = '<div class="empty-state"><p>No photos found for ' + id + '.</p></div>';
              } else {
                 photos.forEach(path => {
                     const imgContainer = document.createElement('div');
                     imgContainer.style.background = '#FFFFFF';
                     imgContainer.style.borderRadius = '8px';
                     imgContainer.style.overflow = 'hidden';
                     imgContainer.style.border = '1px solid #E2E8F0';
                     imgContainer.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
                     
                     const img = document.createElement('img');
                     img.src = path;
                     img.style.width = '100%';
                     img.style.height = '200px';
                     img.style.objectFit = 'cover';
                     img.style.display = 'block';
                     img.loading = 'lazy';
                     
                     const p = document.createElement('p');
                     p.style.margin = '0';
                     p.style.padding = '8px';
                     p.style.fontSize = '12px';
                     p.style.color = '#334155';
                     p.style.background = '#F8FAFC';
                     p.style.borderTop = '1px solid #E2E8F0';
                     p.style.wordBreak = 'break-all';
                     const filename = path.split('/').pop();
                     p.innerText = filename;
                     
                     imgContainer.appendChild(img);
                     imgContainer.appendChild(p);
                     galleryContainer.appendChild(imgContainer);
                 });
              }
          };
          listContainer.appendChild(btn);
      });
      
      if (filtered.length === 0) {
         listContainer.innerHTML = '<p style="color: #64748B; font-size: 12px; padding: 8px;">No structures found.</p>';
      }
  }
  
  renderList();
  
  if (searchInput) {
      searchInput.addEventListener('input', (e) => {
          renderList(e.target.value);
      });
  }
}

function initStatisticsTab() {
  if (window.__statsInitialized) return;
  window.__statsInitialized = true;
  
  const bridges = window.bridgeDataCache?.data || [];
  const culverts = window.bridgeDataCache?.culverts || [];
  
  // Aggregate data
  const bRegions = {};
  const bConditions = {};
  bridges.forEach(b => {
      const r = b.region || 'Unknown';
      bRegions[r] = (bRegions[r] || 0) + 1;
      const c = b.overall_rating || 'Unknown';
      bConditions[c] = (bConditions[c] || 0) + 1;
  });
  
  const cRegions = {};
  const cConditions = {};
  culverts.forEach(c => {
      const r = c.region || 'Unknown';
      cRegions[r] = (cRegions[r] || 0) + 1;
      const cond = c.overall_rating || 'Unknown';
      cConditions[cond] = (cConditions[cond] || 0) + 1;
  });
  
  // Build KPI blocks
  const kpis = document.getElementById('statsKpis');
  if (kpis) {
      kpis.innerHTML = `
        <div class="kpi-card">
          <div class="kpi-label">Total Bridge Crossings</div>
          <div class="kpi-value highlight">${bridges.length}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Total Major Culverts</div>
          <div class="kpi-value highlight">${culverts.length}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Total Structures</div>
          <div class="kpi-value highlight">${bridges.length + culverts.length}</div>
        </div>
      `;
  }
  
  // Helper for charts
  function drawPie(ctxId, dataObj, title) {
      const ctx = document.getElementById(ctxId);
      if (!ctx || !window.Chart) return;
      const labels = Object.keys(dataObj);
      const data = Object.values(dataObj);
      new Chart(ctx, {
          type: 'doughnut',
          data: {
              labels,
              datasets: [{
                  data,
                  backgroundColor: ['#DC2626', '#0071E3', '#16A34A', '#D97706', '#7C3AED', '#0D9488', '#64748B'],
                  borderColor: '#FFFFFF',
                  borderWidth: 2
              }]
          },
          options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'right', labels: { color: '#0F172A', font: {family: 'Plus Jakarta Sans'} } } }
          }
      });
  }
  
  drawPie('chartBridgesRegion', bRegions, 'Bridges by Region');
  drawPie('chartCulvertsRegion', cRegions, 'Culverts by Region');
  drawPie('chartBridgesCondition', bConditions, 'Bridges by Condition');
  drawPie('chartCulvertsCondition', cConditions, 'Culverts by Condition');
}

function initMindMapTab() {
  const container = document.getElementById('mindMapCanvas');
  if (!container) return;

  const treeData = {
    id: 'root',
    title: 'System S: National Bridges & Traffic Intelligence',
    color: '#0071E3',
    desc: 'View-only National Road Network intelligence platform integrating 552 bridges, 452 major culverts, and 21,284.02 km of National Roads with Vision 2040 projections.',
    expanded: true,
    children: [
      {
        id: 'network',
        title: 'National Road Network (21,284.02 km)',
        color: '#16A34A',
        desc: '6,406.69 km paved and 14,877.33 km unpaved across 6 Maintenance Regions and 23 Maintenance Stations.',
        expanded: true,
        children: [
          { id: 'net-a', title: 'International Trunk Roads (2,604.65 km)', color: '#DC2626', desc: 'Class A strategic corridors connecting national borders and regional trade hubs.' },
          { id: 'net-b', title: 'National Trunk Roads (2,845.27 km)', color: '#D97706', desc: 'Class B corridors linking regional centres and major district capitals.' },
          { id: 'net-c', title: 'Primary Roads (15,689.54 km)', color: '#16A34A', desc: 'Class C primary collector and feeder network across all 23 stations.' },
          { id: 'net-m', title: 'Expressways (144.56 km)', color: '#0284C7', desc: 'Class M high-capacity divided motorway corridors.' }
        ]
      },
      {
        id: 'structures',
        title: 'Structures Inventory (Separate Registers)',
        color: '#D97706',
        desc: 'Bridges and Major Culverts are strictly tracked and reported in separate registers and tables.',
        expanded: true,
        children: [
          { id: 'str-bridges', title: '552 Bridges', color: '#0071E3', desc: 'Good: 247, Satisfactory: 71, Marginal: 162, Poor: 52, Critical: 13, Under Construction: 7.' },
          { id: 'str-culverts', title: '452 Major Culverts', color: '#0D9488', desc: 'Good: 403, Satisfactory: 39, Marginal: 4, Poor: 1, Critical: 4, Under Construction: 1.' },
          { id: 'str-visuals', title: '2D Schematics & Inspection Photos', color: '#475569', desc: '2D engineering dimensioned schematics and official inspection photographs only.' }
        ]
      },
      {
        id: 'traffic',
        title: 'Traffic & Vision 2040 Projections',
        color: '#7C3AED',
        desc: 'Classified ADT, heavy axle loading, seasonal factors, and Origin-Destination crossing flows projected to 2040.',
        expanded: true,
        children: [
          { id: 'trf-adt', title: 'Classified ADT & Growth Factors', color: '#7C3AED', desc: 'Annual weighted traffic growth rates projected continuously to 2040 under Vision 2040.' },
          { id: 'trf-od', title: 'Origin-Destination Matrix', color: '#0284C7', desc: 'Per-bridge crossing flow matrix across all 552 bridge crossings.' }
        ]
      },
      {
        id: 'standards',
        title: 'Geospatial & Governance Standards',
        color: '#0D9488',
        desc: 'Esri World Imagery + Hybrid Labels, UK English, dd/mm/yyyy dates, metric units, and strict anonymity.',
        expanded: true,
        children: [
          { id: 'std-map', title: 'Esri World Imagery + Hybrid Labels', color: '#0D9488', desc: 'World_Imagery paired with World_Boundaries_and_Places hybrid reference overlays.' },
          { id: 'std-anon', title: 'View-Only & Strict Anonymity', color: '#16A34A', desc: 'Strictly read-only analytics with zero data-entry forms and complete anonymisation of all asset registers.' }
        ]
      }
    ]
  };

  let selectedId = 'root';

  function selectNode(node) {
    selectedId = node.id;
    const t = document.getElementById('mindMapNodeTitle');
    const d = document.getElementById('mindMapNodeDesc');
    if (t) t.textContent = node.title;
    if (d) d.textContent = node.desc;
  }

  function renderNode(node, depth) {
    const hasKids = Array.isArray(node.children) && node.children.length > 0;
    const isSelected = node.id === selectedId;
    const wrapper = document.createElement('div');
    wrapper.style.marginLeft = depth > 0 ? '24px' : '0';
    wrapper.style.marginTop = '8px';
    wrapper.style.paddingLeft = depth > 0 ? '14px' : '0';
    wrapper.style.borderLeft = depth > 0 ? '2px solid #CBD5E1' : 'none';

    const card = document.createElement('div');
    card.style.display = 'inline-flex';
    card.style.alignItems = 'center';
    card.style.gap = '10px';
    card.style.padding = '10px 14px';
    card.style.borderRadius = '10px';
    card.style.background = isSelected ? '#EFF6FF' : '#FFFFFF';
    card.style.border = `1px solid ${isSelected ? '#0071E3' : '#E2E8F0'}`;
    card.style.borderLeft = `4px solid ${node.color || '#0071E3'}`;
    card.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
    card.style.cursor = 'pointer';
    card.style.color = '#0F172A';
    card.style.fontSize = depth === 0 ? '14px' : '13px';
    card.style.fontWeight = depth <= 1 ? '700' : '600';

    if (hasKids) {
      const badge = document.createElement('span');
      badge.textContent = node.expanded ? '−' : '+';
      badge.style.display = 'inline-flex';
      badge.style.alignItems = 'center';
      badge.style.justifyContent = 'center';
      badge.style.width = '20px';
      badge.style.height = '20px';
      badge.style.borderRadius = '6px';
      badge.style.background = '#F1F5F9';
      badge.style.color = '#0F172A';
      badge.style.fontWeight = '800';
      card.appendChild(badge);
    }

    const label = document.createElement('span');
    label.textContent = node.title;
    card.appendChild(label);

    card.onclick = () => {
      if (hasKids) node.expanded = !node.expanded;
      selectNode(node);
      renderTree();
    };

    wrapper.appendChild(card);

    if (hasKids && node.expanded) {
      const kidsWrap = document.createElement('div');
      node.children.forEach(ch => kidsWrap.appendChild(renderNode(ch, depth + 1)));
      wrapper.appendChild(kidsWrap);
    }

    return wrapper;
  }

  function renderTree() {
    container.innerHTML = '';
    container.appendChild(renderNode(treeData, 0));
  }

  const setAll = (node, val) => {
    if (node.children) {
      node.expanded = val;
      node.children.forEach(c => setAll(c, val));
    }
  };

  const btnExpand = document.getElementById('btnMindMapExpandAll');
  const btnCollapse = document.getElementById('btnMindMapCollapseAll');
  const btnReset = document.getElementById('btnMindMapReset');
  if (btnExpand) btnExpand.onclick = () => { setAll(treeData, true); renderTree(); };
  if (btnCollapse) btnCollapse.onclick = () => { setAll(treeData, false); treeData.expanded = true; renderTree(); };
  if (btnReset) btnReset.onclick = () => { setAll(treeData, true); selectNode(treeData); renderTree(); };

  renderTree();
}
