const check_post = (req, res, next) => {
    const {name, email, message} = req.body;

    if (name.length > 50)
        return res.sendStatus(400);
    
    if (email.length > 50)
        return res.sendStatus(400);
    
    // const regex = 
    // if (.test(email))
}

module.exports = {check_post}