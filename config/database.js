if(process.env.NODE_ENV === "production"){
    module.exports = {mongoURI: 'mongodb://huangsha:huangsha@ds129796.mlab.com:29796/idea-prod'}
}else{
    module.exports = {mongoURI: 'mongodb://localhost/idea'}
};
