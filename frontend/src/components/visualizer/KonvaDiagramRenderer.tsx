import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Stage, Layer, Rect, Circle, Text, Arrow, Line, Group, Ellipse } from 'react-konva';
import gsap from 'gsap';

const SHAPE_MAP: any = { 
    Rect, Circle, Text, Arrow, Line, Group, Ellipse,
    rectangle: Rect,
    rect: Rect,
    circle: Circle,
    text: Text,
    arrow: Arrow,
    line: Line,
    ellipse: Ellipse,
    group: Group
};

const KonvaDiagramRenderer = forwardRef(({ diagramData }: { diagramData: any }, ref) => {
    const [state, setState] = useState<any>({});
    const [shapes, setShapes] = useState<any[]>([]);
    const stageRef = useRef<any>(null);

    const initialize = (spec: any) => {
        if (!spec) return;
        setState(JSON.parse(JSON.stringify(spec.state || {})));
        setShapes(JSON.parse(JSON.stringify(spec.shapes || [])));
    };

    const evaluateExpression = (expr: any, currentState: any) => {
        if (typeof expr !== 'string') return expr;
        
        try {
            const context = {
                state: currentState,
                Math: Math,
                ...(diagramData.context_data || {})
            };

            if (!expr.includes('state.') && !expr.includes('Math.')) {
                if (expr.startsWith("'") || expr.startsWith('"')) return expr.slice(1, -1);
                if (!isNaN(expr as any)) return Number(expr);
            }

            return new Function(...Object.keys(context), `return ${expr}`)(...Object.values(context));
        } catch {
            return expr;
        }
    };

    const handleAction = async (actionId: string) => {
        console.log(`Action Triggered: ${actionId}`);
        const animation = diagramData.animations?.find((a: any) => a.trigger === actionId);
        
        if (animation) {
            for (const step of animation.steps) {
                if (step.state_update) {
                    setState((prev: any) => {
                        const newValue = evaluateExpression(step.value_expr, prev);
                        return { ...prev, [step.state_update]: newValue };
                    });
                }

                if (step.target_id && step.property) {
                    const node = stageRef.current.findOne(`#${step.target_id}`);
                    const value = evaluateExpression(step.value_expr, state);
                    if (node) {
                        gsap.to(node, {
                            [step.property]: value,
                            duration: 0.5,
                            ease: "power2.inOut"
                        });
                    }
                }
                await new Promise(r => setTimeout(r, 50));
            }
            return;
        }

        if (actionId === 'reset') {
            initialize(diagramData);
        }
    };

    useImperativeHandle(ref, () => ({
        handleAction,
        initialize
    }));

    useEffect(() => {
        if (diagramData) {
            initialize(diagramData);
        }
    }, [diagramData]);

    if (!diagramData) return (
        <div className="flex items-center justify-center p-12 text-white/20 font-mono text-sm">
            <div className="animate-pulse">WAITING_FOR_CANVAS_SPEC...</div>
        </div>
    );

    return (
        <div className="relative group p-2 glass-panel rounded-[2rem] overflow-hidden" style={{ width: diagramData.width || 700, height: diagramData.height || 380 }}>
            <Stage
                width={diagramData.width || 700}
                height={diagramData.height || 380}
                ref={stageRef}
                style={{ backgroundColor: diagramData.background || '#1E1E2E' }}
                className="rounded-3xl cursor-crosshair"
            >
                <Layer>
                    {shapes.map((shape: any, idx: number) => {
                        const Component = SHAPE_MAP[shape.type] || SHAPE_MAP[shape.type?.toLowerCase()];
                        if (!Component) return null;

                        const resolvedProps = { ...shape };
                        
                        if (shape.type === 'Text' && shape.text && String(shape.text).includes('state.')) {
                            resolvedProps.text = String(evaluateExpression(shape.text, state));
                        }

                        resolvedProps.shadowBlur = resolvedProps.shadowBlur ?? 20;
                        resolvedProps.shadowOpacity = resolvedProps.shadowOpacity ?? 0.1;
                        resolvedProps.shadowColor = resolvedProps.shadowColor ?? 'black';

                        return <Component key={shape.id || `shape-${idx}`} id={shape.id || `shape-${idx}`} {...resolvedProps} />;
                    })}
                </Layer>
            </Stage>

            <div className="absolute top-4 right-4 text-[10px] font-mono text-primary/40 pointer-events-none uppercase tracking-widest leading-loose bg-black/20 p-2 rounded-lg backdrop-blur-sm">
                {Object.entries(state).map(([k, v]) => (
                    <div key={k}>{k}: {JSON.stringify(v)}</div>
                ))}
            </div>
        </div>
    );
});

KonvaDiagramRenderer.displayName = 'KonvaDiagramRenderer';
export default KonvaDiagramRenderer;
