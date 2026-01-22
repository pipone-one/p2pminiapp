const tg = window.Telegram?.WebApp;

export const isTelegram = !!tg;

export const hapticFeedback = (style = 'light') => {
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred(style);
  }
};

export const openLink = (url) => {
  if (tg) {
    tg.openLink(url);
  } else {
    window.open(url, '_blank');
  }
};

export const expandWebApp = () => {
  if (tg) {
    tg.expand();
    tg.ready();
  }
};
