window.InteractiveEpisodeDrawer = ({ content, onClose }) => {
  const closeDrawer = () => {
    const postId = content && content.postId;
    onClose();
    if (typeof window.setBlogPostContent === 'function') {
      window.setBlogPostContent(null);
    }
    const moment = postId && (window.momentsInTime || []).find((m) => m.id === postId);
    if (moment && typeof window.showMomentCard === 'function') {
      window.showMomentCard(moment);
    }
  };

  React.useEffect(() => {
    if (!content) return undefined;
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      closeDrawer();
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [content, onClose]);

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      'div',
      {
        className: `blog-post-backdrop ${content ? 'open' : ''}`,
        onClick: onClose
      }
    ),
    React.createElement(
      'div',
      {
        className: `blog-post-drawer ${content ? 'open' : ''}`,
        ref: window.blogDrawerRef
      },
      React.createElement(
        'button',
        {
          className: 'close-button',
          onClick: () => {
            onClose();
            window.setBlogPostContent(null);
          }
        },
        '×'
      ),
      React.createElement(
        'div',
        { className: 'interactive-episode-content' },
        window.isLoading && React.createElement('p', null, 'Loading...'),
        window.error && React.createElement('p', { style: { color: 'red' } }, window.error),
        content && React.createElement('div', {
          key: 'content',
          className: 'interactive-episode-body',
          dangerouslySetInnerHTML: { __html: content.content }
        })
      )
    )
  );
};
