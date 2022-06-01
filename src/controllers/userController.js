import user from "../models/user";
import Videos from "../models/video";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

//==================================== 회원가입 페이지 ==============================================

export const getJoin = (req, res) => {
  res.render("join", { pageTitle: "join" });
};
export const postJoin = async (req, res) => {
  const { email, username, password, password2, name, location } = req.body;

  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle: "join",
      errorMsg: "비밀번호 확인이 틀렸습니다!",
    });
  }

  const userExists = await user.exists({ username: username });
  if (userExists) {
    return res.status(400).render("join", {
      pageTitle: "join",
      errorMsg: "이미 사용중인 아이디 입니다!",
    });
  }

  const emailExists = await user.exists({ email: email });
  if (emailExists) {
    return res.status(400).render("join", {
      pageTitle: "join",
      errorMsg: "이미 사용중인 이메일 입니다!",
    });
  }

  try {
    await user.create({
      email,
      username,
      password,
      name,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    return res
      .status(400)
      .render("join", { pageTitle: "join", errorMsg: error._message });
  }
};

//====================================== 유저 로그인 페이지 ==========================================

export const getLogin = (req, res) => {
  return res.render("login", { pageTitle: "Login" });
};

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const User = await user.findOne({ username, socialOnly: false });
  if (!User) {
    return res.status(400).render("login", {
      pageTitle: "Login",
      errorMsg: "사용자의 계정이 존재하지 않습니다!",
    });
  }
  const ok = await bcrypt.compare(password, User.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle: "Login",
      errorMsg: "비밀번호가 틀렸습니다!",
    });
  }
  req.session.loggedIn = true;
  req.session.user = User;
  return res.redirect("/");
};

//========================================= 깃헙 로그인 ========================================

export const startGithubLogin = (req, res) => {
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const baseUrl = "https://github.com/login/oauth/authorize";
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();

  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";

    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    console.log(userData);

    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    console.log(emailData);

    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }

    let User = await user.findOne({ email: emailObj.email });
    if (!User) {
      User = await user.create({
        avatarUrl: userData.avatar_url,
        email: emailObj.email,
        username: userData.login,
        password: "",
        socialOnly: true,
        name: userData.name,
        location: userData.location,
      });
    } else {
      req.session.loggedIn = true;
      req.session.user = User;
      return res.redirect("/");
    }
  } else {
    return res.redirect("/login");
  }
};

//======================================= 프로필 수정 ==============================================

export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit - Profile" });
};

export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { username, name, email, location },
    file,
  } = req;

  const usernameSession = req.session.user.username;
  if (usernameSession !== username) {
    const usernameExists = await user.exists({ username: username });
    if (usernameExists) {
      return res.render("edit-profile", {
        pageTitle: "Edit Profile",
        errorMsg: "이미 사용중인 아이디 입니다!",
      });
    }
  }
  const emailSession = req.session.user.email;
  if (emailSession !== email) {
    const emailExists = await user.exists({ email: email });

    if (emailExists) {
      return res.render("edit-profile", {
        pageTitle: "Edit Profile",
        errorMsg: "이미 사용중인 이메일 입니다!",
      });
    }
  }
  const isHeroku = process.env.NODE_ENV === "production";
  const updateUser = await user.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? (isHeroku ? file.location : file.path) : avatarUrl,
      username,
      name,
      email,
      location,
    },
    { new: true }
  );

  req.session.user = updateUser;
  return res.redirect("/users/edit");
};

//==================================== 비밀번호 변경 페이지 ========================================

export const getChangePwd = (req, res) => {
  return res.render("change-password", { pageTitle: "Change Password" });
};

export const postChangePwd = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { nowpwd, newpwd, newpwd2 },
  } = req;

  if (newpwd !== newpwd2) {
    return res.status(400).render("change-password", {
      pageTitle: "Change Password",
      errorMsg: "비밀번호 확인이 틀렸습니다!",
    });
  }
  const User = await user.findById(_id);
  const ok = await bcrypt.compare(nowpwd, User.password);

  if (!ok) {
    return res.status(400).render("change-password", {
      pageTitle: "Change Password",
      errorMsg: "현재 비밀번호가 틀렸습니다!",
    });
  }

  User.password = newpwd;
  await User.save();
  req.flash("info", "비밀번호가 변경되었습니다!");
  return res.redirect("/users/logout");
};

export const remove = (req, res) => {
  res.send("유저 삭제 페이지");
};

//===================================== 로그아웃 페이지 ===========================================

export const logout = (req, res) => {
  req.session.destroy();

  return res.redirect("/");
};

//===================================== 프로필 페이지 ===========================================

export const see = async (req, res) => {
  const { id } = req.params;
  const User = await user.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
      model: "user",
    },
  });
  if (!User) {
    return res.status(404).render("404", { pateTitle: "User Not Found" });
  }

  return res.render("profile", {
    pageTitle: `${User.name} 프로필`,
    User,
  });
};
