import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Stage, Layer, Rect, Circle, Text, Arrow, Line, Group, Ellipse } from 'react-konva';
import gsap from 'gsap';

const SHAPE_MAP = { 
    Rect, Circle, Text, Arrow, Line, Group, Ellipse,
    // Aliases for robustness
    rectangle: Rect,
    rect: Rect,
    circle: Circle,
    text: Text,
    arrow: Arrow,
    line: Line,
    ellipse: Ellipse,
    group: Group
};

const KonvaDiagramRenderer = forwardRef(({ diagramData }, ref) => {
    // diagramData maps to "canvas_spec" in the new prompt
    const [state, setState] = useState({});
    const [shapes, setShapes] = useState([]);
    const stageRef = useRef(null);

    const initialize = (spec) => {
        if (!spec) return;
        setState(JSON.parse(JSON.stringify(spec.state || {})));
        setShapes(JSON.parse(JSON.stringify(spec.shapes || [])));
    };

    /**
     * Simple Evaluator for value_expr
     * Supports basic arithmetic and state access
     */
    const evaluateExpression = (expr, currentState) => {
        if (typeof expr !== 'string') return expr;
        
        try {
            // Create a safe context for evaluation
            const context = {
                state: currentState,
                Math: Math,
                ...diagramData.context_data 
            };

            // Simple expression check
            if (!expr.includes('state.') && !expr.includes('Math.')) {
                // If it's a literal string like "'#FFF'", return the content
                if (expr.startsWith("'") || expr.startsWith('"')) return expr.slice(1, -1);
                // If it's a number, return it
                if (!isNaN(expr)) return Number(expr);
            }

            return new Function(...Object.keys(context), `return ${expr}`)(...Object.values(context));
        } catch {
            return expr;
        }
    };

    const handleAction = async (actionId) => {
        console.log(`Action Triggered: ${actionId}`);
        
        // 1. Check for declarative sequence
        const animation = diagramData.animations?.find(a => a.trigger === actionId);
        
        if (animation) {
            // Execute declarative steps
            for (const step of animation.steps) {
                if (step.state_update) {
                    setState(prev => {
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

        // 2. Fallback for "move"/"jump" styles if found directly in animations
        const fallback = diagramData.animations?.find(a => a.type === 'move' || a.type === 'jump' || a.type === 'line');
        if (fallback) {
             const targetId = fallback.target_id || fallback.shape;
             const node = stageRef.current.findOne(`#${targetId}`) || stageRef.current.findOne((n) => n.index === fallback.shape);
             if (node) {
                 gsap.to(node, {
                     x: fallback.x ?? node.x(),
                     y: fallback.y ?? node.y(),
                     duration: (fallback.duration || 500) / 1000,
                     ease: "power2.inOut"
                 });
             }
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

    // moved handleAction
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
                    {shapes.map((shape, idx) => {
                        const Component = SHAPE_MAP[shape.type] || SHAPE_MAP[shape.type?.toLowerCase()];
                        if (!Component) return null;

                        const resolvedProps = { ...shape };
                        
                        // Handle dynamic text
                        if (shape.type === 'Text' && shape.text && String(shape.text).includes('state.')) {
                            resolvedProps.text = String(evaluateExpression(shape.text, state));
                        }

                        // visual uplift
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
