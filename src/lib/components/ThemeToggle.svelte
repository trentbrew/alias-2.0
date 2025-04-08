<script lang="ts">
  import { theme, toggleTheme } from '../stores/theme';

  const paletteIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M7 16C6.80222 16 6.60888 16.0586 6.44443 16.1685C6.27998 16.2784 6.15181 16.4346 6.07612 16.6173C6.00043 16.8 5.98063 17.0011 6.01921 17.1951C6.0578 17.3891 6.15304 17.5673 6.29289 17.7071C6.43275 17.847 6.61093 17.9422 6.80491 17.9808C6.99889 18.0194 7.19996 17.9996 7.38268 17.9239C7.56541 17.8482 7.72159 17.72 7.83147 17.5556C7.94135 17.3911 8 17.1978 8 17C8 16.7348 7.89464 16.4804 7.70711 16.2929C7.51957 16.1054 7.26522 16 7 16ZM19.06 12L20.29 10.77C20.8518 10.2075 21.1674 9.445 21.1674 8.65C21.1674 7.855 20.8518 7.0925 20.29 6.53L17.46 3.71C16.8975 3.1482 16.135 2.83264 15.34 2.83264C14.545 2.83264 13.7825 3.1482 13.22 3.71L12 4.94C11.9843 4.15479 11.6613 3.40706 11.1004 2.85736C10.5395 2.30766 9.78536 1.99984 9 2H5C4.20435 2 3.44129 2.31607 2.87868 2.87868C2.31607 3.44129 2 4.20435 2 5V19C2 19.7956 2.31607 20.5587 2.87868 21.1213C3.44129 21.6839 4.20435 22 5 22H19C19.7956 22 20.5587 21.6839 21.1213 21.1213C21.6839 20.5587 22 19.7956 22 19V15C22.0002 14.2146 21.6923 13.4605 21.1426 12.8996C20.5929 12.3387 19.8452 12.0157 19.06 12ZM10 19C10 19.2652 9.89464 19.5196 9.70711 19.7071C9.51957 19.8946 9.26522 20 9 20H5C4.73478 20 4.48043 19.8946 4.29289 19.7071C4.10536 19.5196 4 19.2652 4 19V5C4 4.73478 4.10536 4.48043 4.29289 4.29289C4.48043 4.10536 4.73478 4 5 4H9C9.26522 4 9.51957 4.10536 9.70711 4.29289C9.89464 4.48043 10 4.73478 10 5V19ZM12 7.76L14.64 5.12C14.8274 4.93375 15.0808 4.82921 15.345 4.82921C15.6092 4.82921 15.8626 4.93375 16.05 5.12L18.88 8C19.0663 8.18736 19.1708 8.44081 19.1708 8.705C19.1708 8.96919 19.0663 9.22264 18.88 9.41L16 12.29L12 16.24V7.76ZM20 19C20 19.2652 19.8946 19.5196 19.7071 19.7071C19.5196 19.8946 19.2652 20 19 20H11.82C11.9226 19.7036 11.9799 19.3935 11.99 19.08L17.07 14H19C19.2652 14 19.5196 14.1054 19.7071 14.2929C19.8946 14.4804 20 14.7348 20 15V19Z" fill="currentColor"/> </svg>`;

  // Icons for each theme
  const themeIcons = {
    light: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
    dark: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
    business: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`,
    retro: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`,
  };

  function setTheme(newTheme: 'light' | 'dark' | 'business' | 'retro') {
    theme.set(newTheme);
    localStorage.setItem('alia-theme', newTheme);

    // Apply to document
    const root = document.querySelector('div[data-theme]');
    if (root) {
      root.setAttribute('data-theme', newTheme);
    }
  }
</script>

<div class="dropdown dropdown-end z-20 border-none">
  <div
    tabindex="0"
    role="button"
    class="btn btn-circle m-1 bg-transparent"
    aria-label="Select theme"
  >
    {@html paletteIcon}
  </div>
  <ul
    tabindex="0"
    class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
  >
    <li>
      <a on:click={() => setTheme('light')} class:active={$theme === 'light'}>
        {@html themeIcons.light} Light
      </a>
    </li>
    <li>
      <a on:click={() => setTheme('dark')} class:active={$theme === 'dark'}>
        {@html themeIcons.dark} Dark
      </a>
    </li>
    <li>
      <a
        on:click={() => setTheme('business')}
        class:active={$theme === 'business'}
      >
        {@html themeIcons.business} Business
      </a>
    </li>
    <li>
      <a on:click={() => setTheme('retro')} class:active={$theme === 'retro'}>
        {@html themeIcons.retro} Retro
      </a>
    </li>
  </ul>
</div>
