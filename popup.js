document.addEventListener('DOMContentLoaded', async () => {
  const searchInput = document.querySelector('.search');
  const tabList = document.querySelector('.tab-list');
  const saveButton = document.getElementById('save-session');
  let selectedTabs = new Set();

  async function updateTabs(searchQuery = '') {
    const tabs = await chrome.tabs.query({});
    const groups = await chrome.tabGroups.query({});
    tabList.innerHTML = '';
    const groupedTabs = {};

    tabs.forEach(tab => {
      if (!searchQuery || (tab.title && tab.title.toLowerCase().includes(searchQuery.toLowerCase()))) {
        if (tab.groupId > -1) {
          groupedTabs[tab.groupId] = groupedTabs[tab.groupId] || [];
          groupedTabs[tab.groupId].push(tab);
        } else {
          const div = createTabElement(tab);
          tabList.appendChild(div);
        }
      }
    });

    for (const group of groups) {
      if (groupedTabs[group.id]?.length > 0) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'tab-group';
        groupDiv.style.borderLeft = `4px solid ${group.color || '#666'}`;

        const groupTitle = document.createElement('div');
        groupTitle.className = 'group-title';
        groupTitle.textContent = group.title || 'Group';
        groupTitle.style.padding = '5px';
        groupTitle.style.fontWeight = 'bold';
        groupDiv.appendChild(groupTitle);

        groupedTabs[group.id].forEach(tab => {
          groupDiv.appendChild(createTabElement(tab));
        });

        tabList.appendChild(groupDiv);
      }
    }
  }

  function createTabElement(tab) {
    const div = document.createElement('div');
    div.setAttribute('data-tab-id', tab.id);
    div.className = 'tab-item';
    div.style.padding = '8px';
    div.style.cursor = 'pointer';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.borderBottom = '1px solid #eee';
    div.style.userSelect = 'none';
    div.style.position = 'relative'; // Added for close button positioning

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.style.marginRight = '8px';
    checkbox.addEventListener('change', (e) => {
        e.stopPropagation();
        if (checkbox.checked) {
            selectedTabs.add(tab.id);
            div.style.backgroundColor = '#e3f2fd';
        } else {
            selectedTabs.delete(tab.id);
            div.style.backgroundColor = '';
        }
        updateGroupingControls();
    });
    div.appendChild(checkbox);

    if (tab.favIconUrl) {
        const favicon = document.createElement('img');
        favicon.src = tab.favIconUrl;
        favicon.style.width = '16px';
        favicon.style.height = '16px';
        favicon.style.marginRight = '8px';
        div.appendChild(favicon);
    }

    const title = document.createElement('span');
    title.textContent = tab.title || 'New Tab';
    title.style.overflow = 'hidden';
    title.style.textOverflow = 'ellipsis';
    title.style.whiteSpace = 'nowrap';
    title.style.flex = '1'; // Added to allow space for close button
    div.appendChild(title);

    // Create close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×'; // Using × symbol for close
    closeButton.style.display = 'none'; // Hidden by default
    closeButton.style.border = 'none';
    closeButton.style.background = 'none';
    closeButton.style.color = '#666';
    closeButton.style.fontSize = '18px';
    closeButton.style.padding = '4px 8px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.borderRadius = '4px';
    closeButton.style.marginLeft = '8px';
    closeButton.style.transition = 'all 0.2s';

    closeButton.addEventListener('mouseover', (e) => {
        e.stopPropagation();
        closeButton.style.backgroundColor = '#ff4444';
        closeButton.style.color = 'white';
    });

    closeButton.addEventListener('mouseout', (e) => {
        e.stopPropagation();
        closeButton.style.backgroundColor = 'transparent';
        closeButton.style.color = '#666';
    });

    closeButton.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
            await chrome.tabs.remove(tab.id);
            div.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                div.remove();
            }, 300);
        } catch (error) {
            console.error('Error closing tab:', error);
        }
    });

    div.appendChild(closeButton);

    // Show/hide close button on hover
    div.addEventListener('mouseenter', () => {
        closeButton.style.display = 'block';
        div.style.backgroundColor = checkbox.checked ? '#d0e8fc' : '#f0f0f0';
    });

    div.addEventListener('mouseleave', () => {
        closeButton.style.display = 'none';
        div.style.backgroundColor = checkbox.checked ? '#e3f2fd' : '';
    });

    div.addEventListener('click', (e) => {
        if (e.target !== checkbox && e.target !== closeButton) {
            chrome.tabs.update(tab.id, { active: true });
        }
    });

    // Add CSS animation for smooth removal
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideOut {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(-100%);
            }
        }
    `;
    document.head.appendChild(style);

    return div;
}

  const controlsDiv = document.createElement('div');
  controlsDiv.className = 'grouping-controls';
  controlsDiv.style.padding = '10px';
  controlsDiv.style.borderBottom = '1px solid #ddd';
  controlsDiv.style.display = 'none';

  const groupButton = document.createElement('button');
  groupButton.textContent = 'Group Selected';
  groupButton.style.marginRight = '10px';
  groupButton.addEventListener('click', async () => {
    if (selectedTabs.size < 2) return;
    const groupName = prompt('Enter group name:', 'New Group');
    if (!groupName) return;
    const groupId = await chrome.tabs.group({ tabIds: Array.from(selectedTabs) });
    await chrome.tabGroups.update(groupId, {
      title: groupName,
      color: 'blue'
    });
    
    selectedTabs.clear();
    await updateTabs(searchInput.value);
  });

  const ungroupButton = document.createElement('button');
  ungroupButton.textContent = 'Ungroup Selected';
  ungroupButton.addEventListener('click', async () => {
    if (selectedTabs.size === 0) return;
    
    await chrome.tabs.ungroup(Array.from(selectedTabs));
    selectedTabs.clear();
    await updateTabs(searchInput.value);
  });

  controlsDiv.appendChild(groupButton);
  controlsDiv.appendChild(ungroupButton);
  tabList.parentElement.insertBefore(controlsDiv, tabList);

  function updateGroupingControls() {
    controlsDiv.style.display = selectedTabs.size > 0 ? 'block' : 'none';
    groupButton.disabled = selectedTabs.size < 2;
    ungroupButton.disabled = selectedTabs.size === 0;
  }

  searchInput.addEventListener('input', () => {
    updateTabs(searchInput.value);
  });

  saveButton.addEventListener('click', async () => {
    try {
      const tabs = await chrome.tabs.query({});
      const groups = await chrome.tabGroups.query({});
      const groupData = {};

      groups.forEach(group => {
        groupData[group.id] = {
          title: group.title,
          color: group.color
        };
      });

      const session = {
        timestamp: Date.now(),
        tabs: tabs.map(tab => ({
          url: tab.url,
          title: tab.title || 'New Tab',
          groupId: tab.groupId,
          pinned: tab.pinned,
          favIconUrl: tab.favIconUrl
        })),
        groups: groupData
      };

      const data = await chrome.storage.local.get('sessions');
      const sessions = data.sessions || [];
      sessions.push(session);
      await chrome.storage.local.set({ sessions });
      await loadSavedSessions();
      alert('Session saved successfully!');
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Error saving session');
    }
  });

  async function loadSavedSessions() {
    const data = await chrome.storage.local.get('sessions');
    const sessionsDiv = document.querySelector('.saved-sessions');
    sessionsDiv.innerHTML = '<h3>Saved Sessions</h3>';

    if (!data.sessions || !data.sessions.length) {
      sessionsDiv.innerHTML += '<p>No saved sessions</p>';
      return;
    }

    data.sessions.forEach((session, index) => {
      const sessionDiv = document.createElement('div');
      sessionDiv.className = 'session';
      sessionDiv.style.margin = '10px 0';
      sessionDiv.style.padding = '10px';
      sessionDiv.style.backgroundColor = '#f5f5f5';
      sessionDiv.style.borderRadius = '4px';

      const header = document.createElement('div');
      header.className = 'session-header';
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = 'center';

      const title = document.createElement('div');
      title.innerHTML = `<strong>Session ${index + 1}</strong> - ${new Date(session.timestamp).toLocaleString()}`;
      header.appendChild(title);

      const buttons = document.createElement('div');
      buttons.className = 'session-buttons';
      buttons.style.display = 'flex';
      buttons.style.gap = '8px';

      const restoreBtn = document.createElement('button');
      restoreBtn.textContent = 'Restore';
      restoreBtn.style.padding = '4px 8px';
      restoreBtn.style.cursor = 'pointer';
      restoreBtn.addEventListener('click', () => restoreSession(index));

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.style.padding = '4px 8px';
      deleteBtn.style.cursor = 'pointer';
      deleteBtn.addEventListener('click', () => deleteSession(index));

      buttons.appendChild(restoreBtn);
      buttons.appendChild(deleteBtn);
      header.appendChild(buttons);

      const tabsCount = document.createElement('div');
      tabsCount.className = 'tabs-count';
      tabsCount.textContent = `Tabs: ${session.tabs.length}`;
      tabsCount.style.color = '#666';
      tabsCount.style.marginTop = '5px';

      sessionDiv.appendChild(header);
      sessionDiv.appendChild(tabsCount);
      sessionsDiv.appendChild(sessionDiv);
    });
  }

  async function restoreSession(index) {
    const data = await chrome.storage.local.get('sessions');
    const session = data.sessions[index];
    const groupMap = new Map();

    const tabPromises = session.tabs.map(async (tab) => {
      return new Promise((resolve) => {
        chrome.tabs.create({
          url: tab.url,
          active: false,
          pinned: tab.pinned || false
        }, (newTab) => {
          chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
            if (tabId === newTab.id && info.status === 'complete') {
              chrome.tabs.onUpdated.removeListener(listener);
              resolve({ newTab, originalTab: tab });
            }
          });
        });
      });
    });

    const newTabs = await Promise.all(tabPromises);

    for (const { newTab, originalTab } of newTabs) {
      if (originalTab.groupId > -1) {
        if (!groupMap.has(originalTab.groupId)) {
          const groupId = await chrome.tabs.group({ tabIds: [newTab.id] });
          if (session.groups?.[originalTab.groupId]) {
            await chrome.tabGroups.update(groupId, {
              title: session.groups[originalTab.groupId].title,
              color: session.groups[originalTab.groupId].color
            });
          }
          groupMap.set(originalTab.groupId, groupId);
        } else {
          await chrome.tabs.group({
            groupId: groupMap.get(originalTab.groupId),
            tabIds: [newTab.id]
          });
        }
      }
    }

    await updateTabs(searchInput.value);
    await loadSavedSessions();
  }

  async function deleteSession(index) {
    const data = await chrome.storage.local.get('sessions');
    data.sessions.splice(index, 1);
    await chrome.storage.local.set({ sessions: data.sessions });
    await loadSavedSessions();
  }

  chrome.runtime.onMessage.addListener(async (message) => {
    if (message.type === 'TABS_UPDATED') {
      await updateTabs(searchInput.value);
    }
  });

  await updateTabs();
  await loadSavedSessions();
  addDonationSection(); 
  
// Add to popup.js after loadSavedSessions()
function addDonationSection() {
  const donationSection = document.createElement('div');
  donationSection.className = 'donation-section';
  donationSection.style.padding = '15px';
  donationSection.style.marginTop = '20px';
  donationSection.style.borderTop = '1px solid #ddd';
  donationSection.style.textAlign = 'center';

  // Add Pro Features Banner
  const proFeatures = document.createElement('div');
  proFeatures.style.marginBottom = '20px';
  proFeatures.style.padding = '10px';
  proFeatures.style.backgroundColor = '#f8f9fa';
  proFeatures.style.borderRadius = '8px';
  proFeatures.innerHTML = `
  <h3 style="margin: 0 0 10px 0; color: #1a73e8;">Pro Features Coming Soon!</h3>
  <div style="color: #666; margin-bottom: 10px;">
    ✨ Cloud Sync &nbsp; 🎨 Custom Themes &nbsp; 🔍 Advanced Search &nbsp; 💾 Unlimited Sessions
  </div>
`;

  donationSection.appendChild(proFeatures);

  // Support Developer Section
  const supportTitle = document.createElement('h3');
  supportTitle.textContent = 'Support the Development';
  supportTitle.style.color = '#333';
  supportTitle.style.marginBottom = '10px';
  donationSection.appendChild(supportTitle);

  // Support Message
  const supportMsg = document.createElement('p');
  supportMsg.textContent = 'If you find this extension helpful, consider supporting its development!';
  supportMsg.style.color = '#666';
  supportMsg.style.marginBottom = '15px';
  donationSection.appendChild(supportMsg);

  // Ko-fi Button
  const kofiButton = document.createElement('button');
  kofiButton.textContent = '☕ Buy me a coffee';
  kofiButton.style.backgroundColor = '#FF5E5B';
  kofiButton.style.color = 'white';
  kofiButton.style.border = 'none';
  kofiButton.style.padding = '10px 20px';
  kofiButton.style.borderRadius = '4px';
  kofiButton.style.cursor = 'pointer';
  kofiButton.style.fontWeight = 'bold';
  kofiButton.style.transition = 'background-color 0.2s';

  kofiButton.addEventListener('mouseover', () => {
    kofiButton.style.backgroundColor = '#E54844';
  });

  kofiButton.addEventListener('mouseout', () => {
    kofiButton.style.backgroundColor = '#FF5E5B';
  });

  kofiButton.addEventListener('click', () => {
    // Replace with your Ko-fi page URL
    chrome.tabs.create({ url: 'https://ko-fi.com/zacharia' });
  });

  donationSection.appendChild(kofiButton);

  // GitHub Link
  const githubLink = document.createElement('div');
  githubLink.style.marginTop = '15px';
  githubLink.style.fontSize = '14px';
  githubLink.innerHTML = '<a href="#" style="color: #666; text-decoration: none;">⭐ Star on GitHub</a>';
  githubLink.querySelector('a').addEventListener('click', (e) => {
    e.preventDefault();
    // Replace with your GitHub repository URL
    chrome.tabs.create({ url: 'https://github.com/zacharia1999/tab-manager-extension' });
  });
  donationSection.appendChild(githubLink);

  // Add Rating Request
  const ratingDiv = document.createElement('div');
  ratingDiv.style.marginTop = '15px';
  ratingDiv.style.fontSize = '14px';
  ratingDiv.innerHTML = '<a href="#" style="color: #666; text-decoration: none;">⭐ Rate on Chrome Web Store</a>';
  ratingDiv.querySelector('a').addEventListener('click', (e) => {
    e.preventDefault();
    // Replace with your Chrome Web Store URL once published
    chrome.tabs.create({ url: 'https://chrome.google.com/webstore/detail/your-extension-id' });
  });
  donationSection.appendChild(ratingDiv);

  // Add the donation section to the page
  document.querySelector('.saved-sessions').after(donationSection);
}

});