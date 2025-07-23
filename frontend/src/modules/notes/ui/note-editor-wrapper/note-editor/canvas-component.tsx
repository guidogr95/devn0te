import { useEffect, useRef, useState } from "react";
import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, Slider } from "devnote/modules/shared";
import { ChevronDown, Eraser, Paintbrush } from "lucide-react";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";

type Props = NodeViewProps & {
};

export const CanvasComponent = ({ node, updateAttributes, extension }: Props) => {

  const { isReadOnly } = extension.options;

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
	const [drawing, setDrawing] = useState(false);

	const [color, setColor] = useState("#6366f1");
  const [size, setSize] = useState(5);
  const [tool, setTool] = useState<"brush" | "eraser">("brush");

	useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctxRef.current = ctx;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";

    if (node.attrs.src) {
      const image = new Image();
      image.onload = () => {
        ctx.drawImage(image, 0, 0);
      };
      image.src = node.attrs.src;
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

	useEffect(() => {
    const ctx = ctxRef.current;
    if (ctx) {
      ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
      ctx.lineWidth = size;
    }
  }, [color, size, tool]);

	const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isReadOnly) return;
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setDrawing(true);
  };

  const finishDrawing = () => {
    if (isReadOnly) return;
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!drawing || !ctx || !canvas) return;

    ctx.closePath();
    setDrawing(false);
    const dataURL = canvas.toDataURL("image/png");
    console.log("dataURL:",dataURL);
    updateAttributes({ src: dataURL });
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isReadOnly) return;
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const touchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    if (isReadOnly) return;
    event.preventDefault();
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setDrawing(true);
  };

  const touchEnd = () => {
    if (isReadOnly) return;
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!drawing || !ctx || !canvas) return;

    ctx.closePath();
    setDrawing(false);
    const dataURL = canvas.toDataURL("image/png");
    updateAttributes({ src: dataURL });
  };

  const touchMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
    if (isReadOnly) return;
    if (!drawing) return;
    event.preventDefault();
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleToolChange = (newTool: "brush" | "eraser") => {
    if (drawing) {
      finishDrawing();
    }
    setTool(newTool);
  };

	return (
		<NodeViewWrapper className="draw">
			<div>
        {!isReadOnly && (
          <CanvasToolbar
            size={size}
            color={color}
            tool={tool}
            onColorChange={setColor}
            onToolChange={handleToolChange}
            onSizeChange={setSize}/>
        )}
				<canvas
					ref={canvasRef}
					data-type="canvasNode"
					contentEditable={false}
					width={800}
					height={300}
          style={{
            border: "1px solid #000",
            cursor: isReadOnly ? "default" : tool === "eraser" ? "pointer" : "crosshair",
          }}
					onMouseDown={startDrawing}
					onMouseUp={finishDrawing}
					onMouseMove={draw}
					onMouseLeave={finishDrawing}
					onTouchStart={touchStart}
					onTouchEnd={touchEnd}
					onTouchMove={touchMove}
					onTouchCancel={touchEnd}
				/>
			</div>
		</NodeViewWrapper>
	);
};

type ToolbarProps = {
	onColorChange: (value: string) => void
	onSizeChange: (value: number) => void
	onToolChange: (value: "brush" | "eraser") => void
	color: string
	size: number
	tool: "brush" | "eraser"
}

const CanvasToolbar = ({
	onColorChange,
	onSizeChange,
	onToolChange,
	color,
	tool,
	size
}: ToolbarProps) => {

  return (
    <div className="flex items-center space-x-4 bg-gray-800 !p-4 mb-4 rounded-lg w-fit">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="bg-gray-700 text-gray-200 border-gray-600"
          >
            {tool === "brush" ? (
              <Paintbrush className="mr-2 h-4 w-4" />
            ) : (
              <Eraser className="mr-2 h-4 w-4" />
            )}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-gray-700 text-gray-200 border-gray-600">
          <DropdownMenuItem
            onClick={() => onToolChange("brush")}
            className="focus:bg-gray-600"
          >
            <Paintbrush className="mr-2 h-4 w-4" />
            <span>Brush</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onToolChange("eraser")}
            className="focus:bg-gray-600"
          >
            <Eraser className="mr-2 h-4 w-4" />
            <span>Eraser</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {tool === "brush" && (
        <input
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-8 h-8 rounded-full overflow-hidden appearance-none cursor-pointer"
          style={{ backgroundColor: color }}
        />
      )}
      <div className="flex items-center space-x-2 min-w-[200px]">
        <Slider
          value={[size]}
          onValueChange={(value) => onSizeChange(value[0])}
          max={50}
          step={1}
          className="flex-grow"
        />
        <span className="text-gray-200 w-8 text-center">{size}</span>
      </div>
    </div>
  );
};
