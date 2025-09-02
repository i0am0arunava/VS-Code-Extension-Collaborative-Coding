"use client";
import * as React from "react";
import { createRoot } from "react-dom/client";
import Cursor from "./cur"
import { PiCursor } from "react-icons/pi";

import { styled, useTheme } from "@mui/material/styles";
import Boxes from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import { io, Socket } from "socket.io-client";
import "./a.css";
import { HiMiniCursorArrowRipple } from "react-icons/hi2";
import { useEffect, useState, useRef } from "react";
import axios from "axios";

import { Box, HStack } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS } from "./constants";
import { ChakraProvider } from "@chakra-ui/react";
import themes from "./themes.js";
import Output from "./Output";
import * as monaco from "monaco-editor";
import { VscGitPullRequestCreate } from "react-icons/vsc";
import { BsBoxArrowUpLeft } from "react-icons/bs";
import { SiCodesignal } from "react-icons/si";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Romanesco } from "next/font/google";
import { join } from "path";
const drawerWidth = 380;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

interface User {
  _id: string;
}
export const initialState: User = {
  _id: "",
};

export default function PersistentDrawerLeft() {
  const [type,setype]=useState("")
  const [textValue, setTextValue] = useState("");
  const [user, setuser] = useState<User>(initialState);
  const [showDialog, setShowDialog] = useState(false);
  const isRemoteUpdateRef = useRef(false);
  const [roomID, setRoomID] = useState("");
  const socket = useRef<Socket | null>(null);
  const [myremote, setmyremote] = useState(false);
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
const [uname,setname]=useState("")
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  type Language = keyof typeof CODE_SNIPPETS;

  const [language, setLanguage] = useState<Language>("javascript");

  const onMount = (editor: any) => {
    editorRef.current = editor;
    editor.focus();

  };

  const onSelect = (language: Language) => {
    setLanguage(language);
    setTextValue(CODE_SNIPPETS[language]);
    socket.current!.emit("send-lang", {
      room: roomID,
      langu: language,
    });
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleChange = (
    value: string | undefined,
    ev: monaco.editor.IModelContentChangedEvent
  ) => {
    if (value !== undefined) {
      setmyremote(true);
      setTextValue(value);
      handleEditorChange();
    }
  };

  useEffect(() => {
    socket.current = io("http://localhost:5000");
    const checkUser = async () => {
      const res = await axios.get("/api/users/me");

      setuser(res.data.data);
    };

    checkUser();

    return () => {
      socket.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    console.log("user", user);

    console.log("user adding ....");
    socket.current!.emit("add-user", roomID,uname);
  }, [roomID]);

  useEffect(() => {
    console.log("inner send", myremote);
    if (!isRemoteUpdateRef.current && myremote) {
      console.log("danger");
      socket.current!.emit("send-msg", {
        value: textValue,
        room: roomID,
      });
    } else {
      isRemoteUpdateRef.current = false;
    }
  }, [textValue]);

  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-recieve", (value) => {
        isRemoteUpdateRef.current = true;

        setTextValue(value);
        setmyremote(false);
      });
    }
  }, []);
  useEffect(() => {
    if (socket.current) {
      socket.current.on("lang-recieve", (langu) => {
        setLanguage(langu);
      });
    }
  }, []);
  useEffect(() => {
    setTextValue(CODE_SNIPPETS[language]);
  }, [language]);

  const toggleDialog = () => {
    setShowDialog(!showDialog);
  };

  const handleCreateOrJoinRoom: React.FormEventHandler<HTMLFormElement> = (
    event
  ) => {
    event.preventDefault();
    const target = event.target as typeof event.target & {
      roomid: { value: string };
      uname: { value: string };
    };
    const roomInput = target.roomid.value;
    const uname = target.uname.value;

    if (roomInput) {
      localStorage.setItem("uname", uname);
      setname(uname);
      localStorage.setItem("roomID", roomInput);
      setRoomID(roomInput);
      console.log("room added", roomID);
      // Emit room join/create event to the server
      socket.current!.emit("join-room", roomInput);
  const joinroom=new Audio("join.mp3");
  
      toast.success("Share this roomid to your friend !", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      joinroom.play().catch((err) => {
        console.error("Failed to play leave sound:", err);
      });
      toggleDialog();
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRoomID = localStorage.getItem("roomID");
      if (storedRoomID) {
        setRoomID(storedRoomID);
      }
    }
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const uname = localStorage.getItem("uname");
      if (uname) {
        setname(uname);
      }
    }
  }, []);
console.log('uname',uname)
  const leave = () => {
    socket.current?.emit("leave-room", roomID,uname);
    localStorage.removeItem("roomID");
    setRoomID(""); // Clear the roomID state
    // Notify the server that the user is leaving the room
  };

  useEffect(() => {
    console.log("usert", user);
  }, [user]);

  useEffect(() => {
    socket.current?.on("contact", (val) => {

      toast.success(`${val} is adde !`, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });

    })


  }, [])

  useEffect(() => {
    socket.current?.on("userleft", (val,online) => {
      const leaveSound = new Audio("/leave.mp3");

    
  setAllUsers(online)
    
      if (typeof (val) == "undefined") {
        val = "you"
      }
      toast.error(`${val} have left !`, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      leaveSound.play().catch((err) => {
        console.error("Failed to play leave sound:", err);
      });

    })
  }, [])
  const infoRef = useRef(null);
  const getCursor = (event) => {
    let x = event.clientX;
    let y = event.clientY;
    let _position = `X: ${x}<br>Y: ${y}`;
    socket.current!.emit('cursorMove', _position,y,x,roomID,uname);
    if (infoRef.current) {
      const root = createRoot(infoRef.current);
      root.render(<Cursor text={uname} color={color} type={type} />);
      infoRef.current.style.top = (y-150) + "px";
      infoRef.current.style.left = (x-400) + "px";
    }
  };
useEffect(()=>{
  socket.current!.on('cursorMove', (position,y,x,namex) => {
    // Update the DOM to show the cursor position of other clients
   
    const otherCursor = document.getElementById('otherCursor');
    if (otherCursor) {
      const root = createRoot(otherCursor);
      root.render(<Cursor text={namex} color={color} type={type} />);
      otherCursor.style.top = (y - 150) + "px";
      otherCursor.style.left = (x - 400) + "px";
      
    }
  });
},[])
useEffect(()=>{
  socket.current!.on('cursorMove12', (position,y,x,namex) => {
    // Update the DOM to show the cursor position of other clients
  
    const otherCursor = document.getElementById('otherCursor');
    if (otherCursor) {
      console.log("helowd curddd")
      const root = createRoot(otherCursor);
      root.render(<Cursor text={namex} color={color} type={type} />);
      otherCursor.style.top = (y) + "px";
      otherCursor.style.left = (x) + "px";
      
    }
  });
},[])

const getRandomBrightLightColor = () => {
  // Generate a random color with a higher range to ensure brightness
  const colors = [
    "#FFDDC1", // Light Peach
    "#FFEB3B", // Bright Yellow
    "#FF5722", // Bright Orange
    "#4CAF50", // Bright Green
    "#00BCD4", // Bright Cyan
    "#E91E63", // Bright Pink
    "#9C27B0", // Bright Purple
  ];

  // Pick a random color from the list
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  return randomColor;
};
const [color, setCol] = React.useState(getRandomBrightLightColor());
useEffect(()=>{
setCol(color)
},[])

// const handleKeyDown = () => {
   

//     socket.current!.emit("typingModeOn", '1234', "typing");

// };

// const handleKeyUp = () => {
//   console.log("sasa0",roomID)
// setTimeout(() => {
//   socket.current!.emit("typingModeOff", '1234',"no-typing");
// }, 800); 
//   console.log("yes h")

// };
// useEffect(() => {
//   if (socket.current) {
//     socket.current.on("typingrecieve", (d,t) => {
//       setype(t)
//       console.log("yess")
//     });
//   }
// }, []);
// useEffect(() => {
//   if (socket.current) {
//     socket.current.on("typingrecieveoff", (d,t) => {
//       setype(t)
//     });
//   }
// }, []);
const handleEditorChange = () => {
  if (editorRef.current) {
    console.log("hellow world")
    const position = editorRef.current.getPosition();
    const cursorCoords = editorRef.current.getScrolledVisiblePosition(position);
    if (infoRef.current) {
      const root = createRoot(infoRef.current);
      root.render(<Cursor text={uname} color={color} type={type} />);
      infoRef.current.style.top = `${cursorCoords.top}px`;
      infoRef.current.style.left = `${cursorCoords.left}px`;
     

      socket.current!.emit('cursorMove1','d',cursorCoords.top,cursorCoords.left,roomID,uname);
    }
  }
};
const [allUsers, setAllUsers] = useState<[string, string[]][]>([]);


useEffect(() => {
  socket.current?.on("all-online-users", (users) => {
    setAllUsers(users);

  });

  return () => {
    socket.current?.off("all-online-users");
  };
}, []);

console.log("ww",allUsers);
const matchedRoom = allUsers?.find(item => item[0] === roomID);
const roomUsers = matchedRoom ? matchedRoom[1] : [];

  return (
    <>
      <ToastContainer />
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar position="fixed" open={open} className="hellow">
          <Toolbar className="toolbar">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{ mr: 2, ...(open && { display: "none" }) }}
            >
              <MenuIcon />
            </IconButton>
            <div className="typing-demo">
              <div className="avtar">
                {" "}
                <SiCodesignal />
              </div>

              <p className="coders">hellow coders!</p>
            </div>

            <div className="upContainer">
              <button className="i1" onClick={toggleDialog}>
                {" "}
                <VscGitPullRequestCreate />
                <p className="joinicon">Use room</p>
              </button>
              <button className="i1" onClick={leave}>
                {" "}
                <BsBoxArrowUpLeft />
                <p className="joinicon">Leave room</p>
              </button>

              <div className="i6">
                <p className="mainp1">AP</p>
              </div>
            </div>
          </Toolbar>
        </AppBar>
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              backgroundColor: "black",
            },
          }}
          variant="persistent"
          anchor="left"
          open={open}
        >
          <DrawerHeader>
            <IconButton className="menuit" onClick={handleDrawerClose}>
              {theme.direction === "ltr" ? (
                <ChevronLeftIcon />
              ) : (
                <ChevronRightIcon />
              )}
            </IconButton>
          </DrawerHeader>
          <Divider className="total" />
          <List>
            <div className="helloww">MY GROUP </div>
            <div className="myonline">
            
               
                {roomUsers.map((user, index) => (
<>
<div className="o1">
<p className="mainp">
      {user.charAt(0).toUpperCase() + user.charAt(user.length - 1).toUpperCase()}
    </p>
                <p className="ph">{uname === user ? "you" : user}</p>
              </div>
</>
    ))}
              </div>
          
          </List>
          <Divider />
          <List>
            <div className="helloww">OTHER USERS </div>
            <div className="myonline">
             
              <div className="o2">
                <p className="mainp">PD</p>
                <p className="ph">pranay</p>
              </div>
              <div className="o3">
                <p className="mainp">KS</p>
                <p className="ph">krish</p>
              </div>
              <div className="o4">
                <p className="mainp">SP</p>
                <p className="ph">sumit</p>
              </div>
              <div className="o5">
                <p className="mainp">JP</p>
                <p className="ph">jehan</p>
              </div>
              <div className="o6">
                <p className="mainp">PY</p>
                <p className="ph">rehan</p>
              </div>
              <div className="o6">
                <p className="mainp">PY</p>
                <p className="ph">rehan</p>
              </div>
              <div className="o6">
                <p className="mainp">PY</p>
                <p className="ph">rehan</p>
              </div>
            </div>
          </List>
        </Drawer>
        <Main open={open}>
          <DrawerHeader />
          <div>
            <ChakraProvider theme={themes}>
              <Box>
                <HStack spacing={4}>
                  <Box w="50%">
                    <LanguageSelector language={language} onSelect={onSelect} />
                    <div onMouseMove={getCursor} style={{ position: 'relative' }}>
                      <Editor
                        options={{
                          minimap: {
                            enabled: false,
                          },
                         
                        }}
                        height="75vh"
                        theme="vs-dark"
                        language={language}
                        defaultValue={CODE_SNIPPETS[language]}
                        onMount={onMount}
                        value={textValue}
                        onChange={handleChange}
                        className="info"
                     
                      />
                      <div id="info" ref={infoRef} className="mouse"  ></div>
                      <div id="otherCursor" className="mouse"    ></div>
                    </div>
                  </Box>
                  <Output editorRef={editorRef} language={language} />
                </HStack>
              </Box>
            </ChakraProvider>
          </div>
        </Main>
      </Box>
      {showDialog && (
        <div className="dialog-overlay">
          <div className="dialog">
            <div className="dialog-content">
              <h2>Connect</h2>
              <form onSubmit={handleCreateOrJoinRoom}>
                <div className="form-row">
                  <input type="text" id="workEmail" name="roomid" required />
                </div>
                <div className="form-row">
                  <input type="text" id="user" name="uname" required />
                </div>
                <div className="form-row">
                  <button type="submit">use rommmi d</button>
                </div>
              </form>
              {/* Close dialog button */}
              <button className="close-btn" onClick={toggleDialog}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
