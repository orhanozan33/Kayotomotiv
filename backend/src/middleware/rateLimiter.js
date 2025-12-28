import rateLimit from 'express-rate-limit';

// Genel API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // Her IP için 15 dakikada maksimum 100 istek
  message: 'Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Login endpoint için özel rate limiter (daha sıkı)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // Her IP için 15 dakikada maksimum 5 login denemesi
  message: 'Çok fazla giriş denemesi, lütfen 15 dakika sonra tekrar deneyin.',
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

// Backend password verification için özel rate limiter
export const backendPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 3, // Her IP için 15 dakikada maksimum 3 deneme
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

