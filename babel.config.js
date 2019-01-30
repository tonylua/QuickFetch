module.exports = api => {
  const isTest = api.env('test');
  
  return {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: isTest
            ? {
              node: 'current',
            }
            : {
              browsers: ["> 1%", "last 2 versions", "not ie <= 8"]
            },
          debug: isTest
        },
      ],
    ]
  }
};