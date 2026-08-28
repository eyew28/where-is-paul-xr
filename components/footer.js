window.YEAR_TICK_POS = {
  1988: 8.3, 1994: 12.5,
  2004: 25, 2005: 29.5,
  2022: 41.7, 2023: 46,
  2024: 58.3,
  2025: 75,
  2026: 91.7
};

window.minimapDateToPercent = (date) => {
  const pos = window.YEAR_TICK_POS;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return 50;
  const t = d.getTime();
  const keys = Object.keys(pos).map(Number).sort((a, b) => a - b);
  const times = keys.map((y) => Date.UTC(y, 0, 1));
  if (t <= times[0]) return pos[keys[0]];
  if (t >= times[times.length - 1]) return pos[keys[keys.length - 1]];
  for (let i = 0; i < keys.length - 1; i += 1) {
    if (t >= times[i] && t <= times[i + 1]) {
      const u = (t - times[i]) / (times[i + 1] - times[i]);
      return pos[keys[i]] + (pos[keys[i + 1]] - pos[keys[i]]) * u;
    }
  }
  return 50;
};

window.MINIMAP_EDGE = 1.8;

window.minimapUToLeft = (u) => {
  const edge = window.MINIMAP_EDGE;
  return edge + Math.max(0, Math.min(1, u)) * (100 - edge * 2);
};

window.minimapLeftToU = (leftPercent) => {
  const edge = window.MINIMAP_EDGE;
  return Math.max(0, Math.min(1, (leftPercent - edge) / (100 - edge * 2)));
};

window.scrubTimelineToMinimapU = (u) => {
  const t = Math.max(0, Math.min(1, u));
  const container = document.querySelector('.timeline-scroll');
  if (!container) return;
  const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);
  container.scrollTo({ left: t * maxScroll, behavior: 'smooth' });
};

window.scrubTimelineToMinimapEvent = (event) => {
  const wrap = document.querySelector('.era-band-wrap');
  if (!wrap) return;
  const rect = wrap.getBoundingClientRect();
  if (rect.width <= 0) return;
  const leftPercent = ((event.clientX - rect.left) / rect.width) * 100;
  window.scrubTimelineToMinimapU(window.minimapLeftToU(leftPercent));
};

window.syncMinimapPlayhead = (container) => {
  const playhead = document.querySelector('.era-playhead');
  if (!playhead || !container) return;

  const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);
  const u = maxScroll <= 0 ? 1 : Math.max(0, Math.min(1, container.scrollLeft / maxScroll));
  playhead.style.left = `${window.minimapUToLeft(u)}%`;

  const entries = Array.from(container.querySelectorAll('.tl-entry[data-date]'));
  const yearEl = playhead.querySelector('.era-playhead__year');
  if (!yearEl || entries.length === 0) return;
  const idx = Math.round(u * (entries.length - 1));
  const date = entries[idx].getAttribute('data-date');
  if (date) {
    yearEl.textContent = String(new Date(date).getUTCFullYear());
  }
};

window.Footer = ({ handleTimelineClick, selectedId, setSelectedId, selectedTag, selectedYear }) => {
  // Filter moments by selectedTag and selectedYear
  const filteredMoments = window.momentsInTime.filter(moment => {
    const tagMatch = selectedTag === "All" || moment.tags.includes(selectedTag);
    const yearMatch = selectedYear === "All" || new Date(moment.date).getUTCFullYear().toString() === selectedYear;
    return tagMatch && yearMatch;
  });

  // Group moments by year while preserving original order
  const momentsByYear = filteredMoments.reduce((acc, moment) => {
    const startDate = new Date(moment.date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + moment.stayDuration - 1);
    const startYear = startDate.getUTCFullYear().toString();
    const endYear = endDate.getUTCFullYear().toString();
    
    // Only add moment to its start year
    if (!acc[startYear]) {
      acc[startYear] = [];
    }
    acc[startYear].push(moment);
    
    return acc;
  }, {});

  // Get unique years from filtered moments
  const years = filteredMoments.length > 0 
    ? [...new Set(filteredMoments.map(moment => {
        const startDate = new Date(moment.date);
        return startDate.getUTCFullYear();
      }))].sort((a, b) => a - b)
    : [];

  // Group filtered moments by year, allowing moments to appear in multiple years
  const momentsInTimeByYear = years.reduce((acc, year) => {
    acc[year] = filteredMoments.filter(moment => {
      const startDate = new Date(moment.date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + moment.stayDuration - 1);
      const startYear = startDate.getUTCFullYear();
      const endYear = endDate.getUTCFullYear();
      return year >= startYear && year <= endYear;
    });
    return acc;
  }, {});

  // Update timeline line width to span all entries (runs on layout change and resize/orientation)
  const updateTimelineLineWidth = React.useCallback(() => {
    const timelineLine = document.querySelector('.timeline-rail');
    const entries = document.querySelectorAll('.tl-entry, .tl-year');
    if (timelineLine && entries.length > 0) {
      const totalWidth = Array.from(entries).reduce((acc, entry) => {
        return acc + entry.offsetWidth + 14; // Include margin-right (--entry-gap)
      }, 0) + 22; // Extra padding
      timelineLine.style.width = `${Math.max(100, totalWidth)}px`;
    }
  }, []);

  // UseEffect to dynamically set timeline-line width and scroll to selected moment
  React.useEffect(() => {
    const timeline = document.querySelector('.timeline-track');
    const timelineLine = document.querySelector('.timeline-rail');
    const timelineContainer = document.querySelector('.timeline-scroll');

    const runUpdateLine = () => {
      updateTimelineLineWidth();
    };

    if (timeline && timelineLine) {
      runUpdateLine();
      requestAnimationFrame(runUpdateLine);
      const t = setTimeout(runUpdateLine, 150);
      const onOrientationChange = () => {
        setTimeout(runUpdateLine, 100);
        setTimeout(runUpdateLine, 400);
      };
      window.addEventListener('resize', runUpdateLine);
      window.addEventListener('orientationchange', onOrientationChange);
      return () => {
        clearTimeout(t);
        window.removeEventListener('resize', runUpdateLine);
        window.removeEventListener('orientationchange', onOrientationChange);
      };
    }
  }, [updateTimelineLineWidth, filteredMoments.length, years.length]);

  React.useEffect(() => {
    const container = document.querySelector('.timeline-scroll');
    if (!container) return;
    const scrollToLatest = () => {
      container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
    };
    const t = setTimeout(scrollToLatest, 300);
    return () => clearTimeout(t);
  }, []);

  React.useEffect(() => {
    const container = document.querySelector('.timeline-scroll');
    if (!container) return;
    let raf = null;
    const updateFocusScales = () => {
      const crect = container.getBoundingClientRect();
      const centerX = crect.left + crect.width / 2;
      const entries = Array.from(container.querySelectorAll('.tl-entry'));
      if (entries.length === 0) return;
      const slot = entries[0].offsetWidth + (parseFloat(getComputedStyle(entries[0]).marginRight) || 64);
      const ranked = entries.map(el => {
        const r = el.getBoundingClientRect();
        return { el, dist: Math.abs(r.left + r.width / 2 - centerX) };
      }).sort((a, b) => a.dist - b.dist);
      ranked.forEach(({ el, dist }, i) => {
        const d = dist / slot;
        let scale;
        if (d <= 1) {
          scale = 1.2 - 0.32 * d;
        } else if (d <= 2) {
          scale = 0.88 - 0.24 * (d - 1);
        } else {
          scale = 0.64;
        }
        el.style.setProperty('--focus-scale', String(scale));
        el.classList.remove('is-focus-0', 'is-focus-1', 'is-focus-2');
        if (i === 0) el.classList.add('is-focus-0');
        else if (i <= 2) el.classList.add('is-focus-1');
        else if (i <= 4) el.classList.add('is-focus-2');
      });
      window.syncMinimapPlayhead(container);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        updateFocusScales();
      });
    };
    updateFocusScales();
    container.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    const t = setTimeout(updateFocusScales, 200);
    return () => {
      container.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      clearTimeout(t);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [filteredMoments.length, years.length, selectedId]);

  React.useEffect(() => {
    const timelineContainer = document.querySelector('.timeline-scroll');
    if (!timelineContainer) return;

    const dismissPopover = () => {
      if (document.querySelector('.popover-backdrop')) return;
      if (window.setPopoverContent) window.setPopoverContent(null);
    };

    timelineContainer.addEventListener('scroll', dismissPopover, { passive: true });

    if (selectedId) {
      const selectedEntry = document.querySelector(`.tl-entry[data-id="${selectedId}"]`);
      if (selectedEntry) {
        const entryRect = selectedEntry.getBoundingClientRect();
        const containerRect = timelineContainer.getBoundingClientRect();
        const scrollOffset = entryRect.left + (entryRect.width / 2) - (containerRect.width / 2);
        timelineContainer.scrollTo({
          left: timelineContainer.scrollLeft + scrollOffset,
          behavior: 'smooth'
        });
      }
    }

    return () => {
      timelineContainer.removeEventListener('scroll', dismissPopover);
    };
  }, [selectedId]);

  React.useEffect(() => {
    let dir = 0;
    let raf = null;
    let lastTs = 0;
    let holdTimer = null;
    const pxPerSec = 920;
    const holdDelay = 200;

    const getContainer = () => document.querySelector('.timeline-scroll');

    const setSnap = (on) => {
      const container = getContainer();
      if (!container) return;
      container.style.scrollSnapType = on ? '' : 'none';
    };

    const stepOneCard = (stepDir) => {
      const container = getContainer();
      if (!container) return;
      const entries = Array.from(container.querySelectorAll('.tl-entry'));
      if (entries.length === 0) return;
      const current = container.querySelector('.tl-entry.is-focus-0') || entries[0];
      const idx = entries.indexOf(current);
      const next = entries[Math.max(0, Math.min(entries.length - 1, idx + stepDir))];
      if (!next || next === current) return;
      const entryRect = next.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      container.scrollTo({
        left: container.scrollLeft + entryRect.left + entryRect.width / 2 - containerRect.width / 2,
        behavior: 'smooth'
      });
    };

    const tick = (now) => {
      const container = getContainer();
      if (!container || dir === 0) {
        raf = null;
        lastTs = 0;
        return;
      }
      const dt = lastTs ? Math.min(0.05, (now - lastTs) / 1000) : 1 / 60;
      lastTs = now;
      container.scrollLeft += dir * pxPerSec * dt;
      raf = requestAnimationFrame(tick);
    };

    const isTyping = (event) => {
      const tag = event.target && event.target.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (event.target && event.target.isContentEditable);
    };

    const onKeyDown = (event) => {
      if (isTyping(event)) return;
      if (document.body.classList.contains('comic-is-open')) return;
      if (document.querySelector('.popover-backdrop')) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        if (event.repeat) return;
        dir = event.key === 'ArrowRight' ? 1 : -1;
        if (holdTimer) clearTimeout(holdTimer);
        holdTimer = setTimeout(() => {
          holdTimer = null;
          setSnap(false);
          lastTs = 0;
          if (!raf) raf = requestAnimationFrame(tick);
        }, holdDelay);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const current = document.querySelector('.tl-entry.is-focus-0');
        if (current) current.click();
      }
    };

    const onKeyUp = (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      const wasDir = dir;
      if ((event.key === 'ArrowRight' && dir === 1) || (event.key === 'ArrowLeft' && dir === -1)) {
        dir = 0;
      }
      if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;
        if (wasDir !== 0) stepOneCard(wasDir);
      }
      setSnap(true);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      dir = 0;
      if (holdTimer) clearTimeout(holdTimer);
      setSnap(true);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [handleTimelineClick]);

  // Helper function for tooltip full date
  const formatFullDateRange = (startDate, duration) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + duration - 1);
    const options = { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' };
    return `${start.toLocaleDateString('en-US', options)} – ${end.toLocaleDateString('en-US', options)}`;
  };

  // Era for a given year
  const ERA_DEFS = [
    { key: 'childhood',    label: 'Childhood',       years: "'88–'03",      start: '1988-01-01', end: '2003-12-31' },
    { key: 'comingofage', label: 'Coming of Age',   years: "'04–'21",      start: '2004-01-01', end: '2021-12-31' },
    { key: 'firsttravels', label: 'First Travels',   years: "Jul '22–Oct '23", start: '2022-07-01', end: '2023-10-31' },
    { key: 'americas',     label: 'Americas',       years: "May '24–Jul '25", start: '2024-05-01', end: '2025-07-31' },
    { key: 'sea',          label: 'Southeast Asia', years: "Aug '25–Feb '26", start: '2025-08-01', end: '2026-02-28' },
    { key: 'sovereignty',  label: 'Sovereignty',    years: "Feb '26–",     start: '2026-02-28', end: '2026-12-31' }
  ];
  const eraForDate = (dateStr) => {
    const d = new Date(dateStr).getTime();
    for (const era of ERA_DEFS) {
      if (d >= new Date(era.start).getTime() && d <= new Date(era.end).getTime()) return era.label;
    }
    return 'Nomad';
  };
  const eraKeyForDate = (dateStr) => {
    const d = new Date(dateStr).getTime();
    for (const era of ERA_DEFS) {
      if (d >= new Date(era.start).getTime() && d <= new Date(era.end).getTime()) return era.key;
    }
    return 'nomad';
  };

  // ISO 3166-ish country / US-state code map for the short location badge
  const COUNTRY_CODES = {
    'bulgaria': 'BG', 'greece': 'GR', 'lebanon': 'LB', 'jordan': 'JO',
    'turkey': 'TR', 'thailand': 'TH', 'vietnam': 'VN', 'philippines': 'PH',
    'indonesia': 'ID', 'spain': 'ES', 'portugal': 'PT', 'mexico': 'MX',
    'colombia': 'CO', 'brazil': 'BR', 'singapore': 'SG',
    'united arab emirates': 'AE', 'japan': 'JP',
    'texas': 'TX', 'colorado': 'CO', 'florida': 'FL', 'california': 'CA',
    'illinois': 'IL', 'wisconsin': 'WI', 'louisiana': 'LA', 'utah': 'UT',
    'hawaii': 'HI', 'tennessee': 'TN'
  };
  const shortLocation = (name) => {
    if (!name) return '';
    const parts = name.split(',').map(s => s.trim());
    if (parts.length < 2) return name;
    const city = parts[0];
    const region = parts.slice(1).join(',').trim();
    const key = region.toLowerCase();
    const code = COUNTRY_CODES[key];
    if (code) return `${city}, ${code}`;
    if (region.length <= 3) return `${city}, ${region}`;
    return `${city}, ${region}`;
  };

  // Short month + 2-digit year: "Nov '88"
  const formatShortMonthYear = (dateStr) => {
    const d = new Date(dateStr);
    const month = d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
    return `${month} ${d.getUTCDate()}`;
  };

  // Short duration from formattedDuration: "6 years" -> "6 yrs", "30 d" stays, "1 day" -> "1 d"
  const formatShortDuration = (formattedDuration) => {
    if (!formattedDuration) return '';
    const s = String(formattedDuration);
    return s
      .replace(/\byears?\b/gi, 'yrs')
      .replace(/\bmonths?\b/gi, 'mo')
      .replace(/\bdays?\b/gi, 'd')
      .replace(/\band\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Resolve an image URL the same way the old render did (attachment:// -> withBase)
  const resolveImg = (src) => {
    if (!src) return '';
    if (src.indexOf('attachment://') === 0) src = src.replace('attachment://', '');
    if (/^(https?:)?\/\//.test(src) || src.indexOf('data:') === 0) return src;
    return window.withBase ? window.withBase(src) : src;
  };

  // Jump the timeline scroll to the first entry of a given year
  const jumpToYear = (year) => {
    const container = document.querySelector('.timeline-scroll');
    if (!container) return;
    const target = document.querySelector(`.tl-year[data-year="${year}"]`) ||
                   document.querySelector(`.tl-entry[data-year="${year}"]`);
    if (target) {
      const targetRect = target.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const offset = targetRect.left + (targetRect.width / 2) - (containerRect.width / 2);
      container.scrollTo({ left: container.scrollLeft + offset, behavior: 'smooth' });
    }
  };

  // Jump to the first entry of an era (by its starting year)
  const jumpToEra = (year) => jumpToYear(year);

  // Era definitions for the minimap
  const ERAS = ERA_DEFS;

  // Years that get a tick on the minimap (every year that has entries, deduped)
  const minimapYears = years.length > 0
    ? [...new Set(years)].sort((a, b) => a - b)
    : [];
  const minYear = minimapYears.length > 0 ? minimapYears[0] : 1988;
  const maxYear = minimapYears.length > 0 ? minimapYears[minimapYears.length - 1] : 2026;
  const yearToPercent = (y) => window.YEAR_TICK_POS[y] != null ? window.YEAR_TICK_POS[y] : 50;

  // Determine the active era based on the currently selected moment
  const selectedMoment = selectedId && (
    filteredMoments.find((x) => x.id === selectedId) ||
    (window.momentsInTime || []).find((x) => x.id === selectedId)
  );
  const playheadMoment = selectedMoment || (filteredMoments.length ? filteredMoments[filteredMoments.length - 1] : null);
  const activeEraKey = playheadMoment ? eraKeyForDate(playheadMoment.date) : 'nomad';
  const playheadPercent = playheadMoment ? window.minimapDateToPercent(playheadMoment.date) : null;
  const playheadYear = playheadMoment ? new Date(playheadMoment.date).getUTCFullYear() : null;

  return React.createElement(
    'footer',
    { className: 'wip-footer' },

    React.createElement(
      'div',
      { className: 'timeline-scroll' },
      React.createElement(
        'div',
        { className: 'timeline-track' },
        React.createElement('div', { className: 'timeline-rail' }),
        filteredMoments.length === 0
          ? React.createElement('div', { className: 'timeline-empty' }, 'No adventures found for the selected filters')
          : years.map((year, index) => {
              const yearMoments = momentsByYear[year] || [];
              if (yearMoments.length === 0) return null;
              return [
                React.createElement(
                  'div',
                  {
                    key: `year-${year}`,
                    className: 'tl-year',
                    'data-year': year,
                    style: { '--i': index }
                  },
                  React.createElement('div', { className: 'tl-year__label' }, String(year)),
                  React.createElement('div', { className: 'tl-year__node' },
                    React.createElement('div', { className: 'tl-year__dot' })
                  )
                ),
                ...yearMoments.map((moment, mIdx) => {
                  const fullDateRange = formatFullDateRange(moment.date, moment.stayDuration);
                  const isComic = moment.isComic && moment.fullLink !== '#';
                  const isPost = !moment.isComic && moment.fullLink !== '#';
                  const coverThumb = isComic
                    ? resolveImg((moment.cover || moment.fullLink.replace(/\/$/, '') + '/cover.webp').replace(/cover\.webp$/, 'cover-thumb.webp'))
                    : null;
                  const coverFull = isComic
                    ? resolveImg(moment.cover || (moment.fullLink.replace(/\/$/, '') + '/cover.webp'))
                    : null;
                  const imgSrc = coverThumb || resolveImg(moment.image);

                  return React.createElement(
                    'article',
                    {
                      key: `${moment.id}-${year}`,
                      className: `tl-entry ${isComic ? 'tl-entry--comic' : ''} ${selectedId === moment.id ? 'selected' : ''}`,
                      'data-id': moment.id,
                      'data-year': year,
                      'data-date': new Date(moment.date).toISOString(),
                      onClick: () => { handleTimelineClick(moment); },
                      style: { '--i': index + 1 + mIdx }
                    },

                    React.createElement(
                      'div',
                      { className: 'tl-entry__media' },
                      isComic && React.createElement('span', { className: 'comic-ribbon' }, 'Comic'),
                      isPost && !moment.image && React.createElement('span', { className: 'tl-entry__post-badge' }, 'Read'),
                      imgSrc
                        ? React.createElement('img', {
                            src: imgSrc,
                            alt: moment.imageAlt || moment.title,
                            width: 185,
                            height: 310,
                            decoding: 'async',
                            loading: 'lazy',
                            onError: function(e) {
                              if (coverThumb && e.target.src === coverThumb && coverFull) {
                                e.target.src = coverFull;
                              } else {
                                var media = e.target.parentElement;
                                if (media) media.classList.add('tl-entry__media-fallback');
                                e.target.style.display = 'none';
                              }
                            }
                          })
                        : React.createElement('div', { className: 'tl-entry__placeholder' }, '✦'),
                      React.createElement(
                        'div',
                        { className: 'tl-entry__card' },
                        React.createElement(
                          'div',
                          { className: 'tl-entry__title', title: fullDateRange },
                          moment.timelineHighlight || moment.title
                        ),
                        React.createElement(
                          'div',
                          { className: 'tl-entry__meta' },
                          React.createElement('span', { className: 'tl-entry__loc' }, shortLocation(moment.location && moment.location.name)),
                          !isComic && React.createElement('span', { className: 'tl-entry__meta-sep' }),
                          !isComic && React.createElement('span', null, formatShortDuration(moment.formattedDuration))
                        )
                      )
                    ),

                    React.createElement('div', { className: 'tl-entry__node' },
                      React.createElement('div', { className: 'tl-entry__dot' }),
                      React.createElement('div', { className: 'tl-entry__date' }, formatShortMonthYear(moment.date))
                    )
                  );
                })
              ];
            }).flat()
      )
    ),

    React.createElement(
      'div',
      { className: 'era-minimap', role: 'navigation', 'aria-label': 'Lifetime eras' },
      React.createElement(
        'div',
        { className: 'era-ticks' },
        minimapYears.map(y => React.createElement(
          'button',
          {
            key: `tick-${y}`,
            type: 'button',
            className: `era-tick ${selectedId && new Date((filteredMoments.find(m => m.id === selectedId) || {}).date || new Date()).getUTCFullYear() === y ? 'is-current' : ''}`,
            style: { left: `${yearToPercent(y)}%` },
            onClick: (event) => {
              event.stopPropagation();
              if (event.currentTarget && event.currentTarget.blur) event.currentTarget.blur();
              window.scrubTimelineToMinimapEvent(event);
            },
            'aria-label': `Jump to ${y}`
          },
          String(y)
        ))
      ),
      React.createElement(
        'div',
        {
          className: 'era-band-wrap',
          onClick: (event) => window.scrubTimelineToMinimapEvent(event)
        },
        React.createElement(
          'div',
          { className: 'era-band' },
          ...ERAS.map(era => React.createElement(
            'button',
            {
              key: era.key,
              type: 'button',
              className: `era-seg era-seg--${era.key} ${activeEraKey === era.key ? 'active' : ''}`,
              onClick: (event) => {
                event.stopPropagation();
                if (event.currentTarget && event.currentTarget.blur) event.currentTarget.blur();
                window.scrubTimelineToMinimapEvent(event);
              },
              'aria-label': `Jump to ${era.label}`
            },
            React.createElement('span', { className: 'era-seg__label' }, era.label),
            React.createElement('span', { className: 'era-seg__years' }, era.years)
          ))
        ),
        playheadPercent != null && React.createElement(
          'div',
          {
            className: 'era-playhead',
            style: { left: `${playheadPercent}%` },
            title: playheadMoment ? `Now: ${playheadMoment.title}` : undefined,
            'aria-hidden': true
          },
          playheadYear != null && React.createElement('span', { className: 'era-playhead__year' }, String(playheadYear))
        )
      )
    )
  );
};