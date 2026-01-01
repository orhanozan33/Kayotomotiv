    pool.on('connect', () => {
      console.log('✅ Database connected successfully');
    });

    pool.on('error', (err: any) => {
      console.error('❌ Unexpected error on idle client', {
        message: err.message,
        code: err.code,
      });
    });
  }

  return pool;
}

export default getPool;
