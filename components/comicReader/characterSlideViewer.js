// ============================================================================
// Character Slide Viewer — 2 ImmersiveV4 readers side by side (desktop)
// or 1 ImmersiveV4 (mobile). Reuses ImmersiveV4 for identical UX.
// ============================================================================

(function() {
  const BREAKPOINT_DESKTOP = 1024;

  function characterPageToEpisodeData(page) {
    const { image, video, alt, name, role, bio, description } = page;
    const narrative = bio || description || '';

    const lede = description && description !== narrative ? description : null;
    const narrativeContent = React.createElement('div', { className: 'character-story' }, [
      role && React.createElement('p', { key: 'role', className: 'character-story__role' }, role),
      name && React.createElement('h2', { key: 'name', className: 'character-story__name' }, name),
      lede && React.createElement('p', { key: 'lede', className: 'character-story__lede' }, lede),
      narrative && React.createElement('p', { key: 'bio', className: 'character-story__bio' }, narrative)
    ]);

    const pages = [];
    if (video) {
      pages.push({ type: 'video', src: video, poster: image });
    } else {
      pages.push(image);
    }
    if (narrative) {
      pages.push({ type: 'custom', children: narrativeContent, style: { justifyContent: 'flex-start' } });
    }

    return { pages, fullLink: '/characters/' };
  }

  window.ComicReaderCharacterSlideViewer = function CharacterSlideViewerContent({ episodeData, styles, navState = {} }) {
    const { onBackToCover, previousPage, currentPage = 1, onVideoPlayStateChange, onSlidesSwitchingChange, onTapToShowControls } = navState;
    const [isDesktop, setIsDesktop] = React.useState(
      () => typeof window !== 'undefined' && window.innerWidth >= BREAKPOINT_DESKTOP
    );

    React.useEffect(() => {
      const update = () => setIsDesktop(window.innerWidth >= BREAKPOINT_DESKTOP);
      window.addEventListener('resize', update);
      window.addEventListener('orientationchange', update);
      return () => {
        window.removeEventListener('resize', update);
        window.removeEventListener('orientationchange', update);
      };
    }, []);

    const pages = (episodeData && episodeData.pages) || [];
    const isTwoUp = isDesktop && pages.length > 1;
    const pageIndex = Math.max(0, Math.min(currentPage - 1, pages.length - 1));

    const displayPages = isTwoUp
      ? [pages[pageIndex], pageIndex + 1 < pages.length ? pages[pageIndex + 1] : null].filter(Boolean)
      : [pages[pageIndex]].filter(Boolean);

    if (!episodeData || !pages.length) return null;

    const columns = displayPages.map((p, i) => {
      const charIndex = pageIndex + i;
      const columnKey = 'col-' + charIndex;
      const v4EpisodeData = characterPageToEpisodeData(p);
      const onFirstSlideBack = i === 0 && (typeof onBackToCover === 'function' || typeof previousPage === 'function')
        ? () => (currentPage <= 1 ? onBackToCover?.() : previousPage?.())
        : undefined;
      return React.createElement('div', {
        key: columnKey,
        className: 'comic-character-immersive-column',
        style: { flex: '1 1 0', minWidth: 0, height: '100%' }
      }, React.createElement(window.ComicReaderImmersiveV4, {
        key: 'immersive-' + columnKey,
        episodeData: v4EpisodeData,
        styles,
        navState: {
          onBackToCover: onFirstSlideBack,
          onVideoPlayStateChange,
          onSlidesSwitchingChange: onSlidesSwitchingChange || (() => {}),
          onTapToShowControls,
          noAutoplay: true,
          initialSlideIndex: 0,
          onSlideChange: undefined
        }
      }));
    });

    return React.createElement('div', {
      className: 'comic-character-slide-viewer',
      style: {
        width: '100%',
        height: '100%',
        background: '#000',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch'
      }
    }, columns);
  };
})();
