import rateLimit from 'express-rate-limit';

// Genel API rate limiter
// Not: trust proxy: 1 kullanıldığı için validation uyarısı alınabilir, ancak Zeabur gibi platformlar için gerekli
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 1000, // Yüksek limit - trust proxy kullanıldığı için daha esnek
  message: 'Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Login endpoint için özel rate limiter (daha sıkı)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 20, // Yüksek limit - trust proxy kullanıldığı için daha esnek
  message: 'Çok fazla giriş denemesi, lütfen 15 dakika sonra tekrar deneyin.',
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

// Backend password verification için özel rate limiter
export const backendPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 10, // Yüksek limit - trust proxy kullanıldığı için daha esnek
  message: 'Çok fazla şifre denemesi, lütfen 15 dakika sonra tekrar deneyin.',
  standardHeaders: true,
  legacyHeaders: false,
});

// SQL execution için özel rate limiter
export const sqlExecutionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 dakika
  max: 10, // Her IP için 1 dakikada maksimum 10 SQL sorgusu
  message: 'Çok fazla SQL sorgusu, lütfen bir dakika bekleyin.',
  standardHeaders: true,
  legacyHeaders: false,
});

