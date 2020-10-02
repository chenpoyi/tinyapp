const getUserByEmail = function(email, users) {
  //console.log("users in check: ", users);
  for (let id in users) {
    const user = users[id];
    if (user.email === email) {
      return user;
    }

  }
  return undefined;

};

const generateRandomString = function() { //random string for shortened url
  let result = '';
  const charList = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 6; i++) {
    const newIndex = Math.floor(Math.random() * charList.length);
    result += charList[newIndex];
  }
  return result;
};

module.exports = {getUserByEmail, generateRandomString};