import React, { useRef, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:8080");

const Board = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 4;
    ctxRef.current = ctx;

    socket.on("draw", ({ fromX, fromY, toX, toY, color }) => {
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();
    });

    return () => {
      // Clean up
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseDown = (e) => {
    const { clientX, clientY } = e;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(clientX, clientY);

    const onMouseMove = (e) => {
      const { clientX, clientY } = e;
      ctxRef.current.lineTo(clientX, clientY);
      ctxRef.current.stroke();

      // Reset the timeout on mouse movement
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        const base64ImageData = canvasRef.current.toDataURL("image/png");
        socket.emit("draw", base64ImageData);
      }, 100);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  useEffect(() => {
    socket.on("draw", (data) => {
      const image = new Image();
      image.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
      };
      image.src = data;
      // console.log("get image: ", image);
    });
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} onMouseDown={handleMouseDown} />
    </div>
  );
};

export default Board;

// import React, { useRef, useEffect } from "react";
// import io from "socket.io-client";

// const socket = io("http://localhost:8080");

// const Board = () => {
//   const canvasRef = useRef(null);
//   const ctxRef = useRef(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;
//     const ctx = canvas.getContext("2d");
//     ctx.lineCap = "round";
//     ctx.strokeStyle = "black";
//     ctx.lineWidth = 2;
//     ctxRef.current = ctx;

//     socket.on("draw", ({ fromX, fromY, toX, toY, color }) => {
//       ctx.strokeStyle = color;
//       ctx.beginPath();
//       ctx.moveTo(fromX, fromY);
//       ctx.lineTo(toX, toY);
//       ctx.stroke();
//     });

//     return () => {
//       // socket.disconnect();
//       // <h1>hi</h1>;
//     };
//   }, []);

//   const handleMouseDown = (e) => {
//     const { clientX, clientY } = e;
//     ctxRef.current.beginPath();
//     ctxRef.current.moveTo(clientX, clientY);

//     socket.emit("draw", {
//       fromX: clientX,
//       fromY: clientY,
//       toX: clientX,
//       toY: clientY,
//       color: ctxRef.current.strokeStyle,
//     });

//     const onMouseMove = (e) => {
//       const { clientX, clientY } = e;
//       ctxRef.current.lineTo(clientX, clientY);
//       ctxRef.current.stroke();

//       socket.emit("draw", {
//         fromX: clientX,
//         fromY: clientY,
//         toX: clientX,
//         toY: clientY,
//         color: ctxRef.current.strokeStyle,
//         test: "pt"
//       });
//     };

//     const onMouseUp = () => {
//       document.removeEventListener("mousemove", onMouseMove);
//       document.removeEventListener("mouseup", onMouseUp);
//     };

//     document.addEventListener("mousemove", onMouseMove);
//     document.addEventListener("mouseup", onMouseUp);
//   };

//   return (
//     <canvas
//       ref={canvasRef}
//       style={{ background: "white", position: "absolute", top: 0, left: 0 , height: "90%"}}
//       onMouseDown={handleMouseDown}
//     />
//   );
// };

// export default Board;
