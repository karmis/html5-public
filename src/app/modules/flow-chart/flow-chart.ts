import {ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild, ViewEncapsulation} from "@angular/core";
import {jsPlumb} from 'jsplumb';
import {TranslateService} from "@ngx-translate/core";

let dagre = require("dagre");

@Component({
    selector: 'flow-chart',
    templateUrl: './tpl/index.html',
    styleUrls: [
        './styles/index.scss'
    ],
    encapsulation: ViewEncapsulation.None
})

export class FlowChartComponent {
    @Input("draggableNodes") public draggableNodes: boolean = false;
    @Input("enableControls") public enableControls: boolean = true;
    @Input("enableMinimap") public enableMinimap: boolean = true;
    @Input("enableDebugControls") public enableDebugControls: boolean = false;

    @Output("onClickBlock") public onClickBlock: EventEmitter<any> = new EventEmitter<any>();
    @Output("onDblClickBlock") public onDblClickBlock: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('flowchartCanvas', {static: false}) public flowchart;
    @ViewChild('flowchartWrapper', {static: false}) public flowchartWrapper;
    @ViewChild('minimpDrag', {static: false}) public minimpDrag;
    @ViewChild('minimpWrapper', {static: false}) public minimpWrapper;

    private flowChartInstance = null;

    private connectorPaintStyle;
    private connectorPaintStyleInactive;
    private connectorHoverStyle;
    private endpointHoverStyle;

    private sourceEndpoint;
    private sourceEndpointInactive;
    private targetEndpoint;
    private targetEndpointInactive;

    private blocks = [];
    private blocksLinks = [];

    private nodesep = 25;
    private edgesep = 10;
    private ranksep = 50;
    private marginx = 0;
    private marginy = 0;

    private defaultZoom = 5000;
    private currentZoom = 100;

    private initialX;
    private initialY;
    private currentX;
    private currentY;
    private xOffset = 0;
    private yOffset = 0;
    private xOffsetSecond = 0;
    private yOffsetSecond = 0;
    private active = false;
    private flowSizeWidth = 0;
    private flowSizeHeight = 0;
    private minY = 0;
    private maxY = 0;
    private minX = 0;
    private maxX = 0;
    private coefW;
    private coefH;
    private dimensionsBuilded = false;
    private minimapShowed = false;
    private minimapShowedManual = true;

    constructor(private cdr: ChangeDetectorRef,
                private translate: TranslateService) {
    }

    Init(blocks, blocksLinks) {
        this.blocks = [];
        this.blocksLinks = [];

        this.blocks = blocks;
        this.blocksLinks = blocksLinks;
        this.cdr.detectChanges();
        let self = this;
        if (this.flowChartInstance) {
            this.flowChartInstance.deleteEveryConnection();
            this.flowChartInstance.deleteEveryEndpoint();
            this.flowChartInstance.repaintEverything();
        }
        this.flowChartInstance = jsPlumb.getInstance({
            // default drag options
            DragOptions: {
                cursor: 'pointer',
                zIndex: 2000,
                drag: function (e) {
                    if ($(e.el).hasClass('flowchart')) {
                        self.flowChartInstance.repaintEverything();
                        self.updateFrame();
                    } else {
                        self.flowChartInstance.repaint($(this));
                    }
                },
                stop: function (e) {
                    if ($(e.el).hasClass('flowchart')) {
                        self.flowChartInstance.repaintEverything();
                        self.updateFrame();
                    } else {
                        self.flowChartInstance.repaint($(this));
                    }
                }
            },
            // the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
            // case it returns the 'labelText' member that we set on each connection in the 'init' method below.
            ConnectionOverlays: [
                ["Arrow", {
                    location: 1,
                    visible: true,
                    width: 11,
                    length: 11,
                    id: "ARROW",
                    // events: {
                    //     click: () => {
                    //         alert("you clicked on the arrow overlay")
                    //     }
                    // }
                }],
                // ["Label", {
                //     location: 0.1,
                //     id: "label",
                //     cssClass: "aLabel",
                //     events: {
                //         tap: () => {
                //             alert("you clicked on the arrow label");
                //         }
                //     }
                // }]
            ],
            Container: this.flowchart.nativeElement
        });
        let instance = this.flowChartInstance;

        this.registerConnectorStyles();
        this.registerEndpoints();
        let windows = $(".window");
        // suspend drawing and initialise.
        instance.batch(() => {
            for (let i = 0; i < blocksLinks.length; i++) {
                let sourceId = blocksLinks[i].source.taskIndex;
                let targetId = blocksLinks[i].target.taskIndex;
                let outId = blocksLinks[i].linkData.ParentOut;
                let outputs = blocksLinks[i].source.task.Outputs;
                let inactive = blocksLinks[i].target.task.Inactive || blocksLinks[i].source.task.Inactive;
                let inactiveThis = blocksLinks[i].target.task.Inactive;
                this.generateEndpoints(instance, "flowchart" + sourceId, ["Right" + outId], [], [], [], "Right", null, outputs, outId, inactive);
                this.generateEndpoints(instance, "flowchart" + targetId, [], ["Left" + targetId], [], ["Left"], null, null, null, null, inactiveThis);
                instance.connect({
                    uuids: ["flowchart" + sourceId + "Right" + outId, "flowchart" + targetId + "Left" + targetId],
                    editable: false
                });
            }

            // listen for new connections; initialise them the same way we initialise the connections at startup.
            instance.bind("connection", (connInfo, originalEvent) => {
                this.initConnection(connInfo.connection);
            });

            // make all the window divs draggable
            if (this.draggableNodes)
                instance.draggable(instance.getSelector(".flowchart .window"), {
                    grid: [20, 20],
                    stop: (event, ui) => {
                        this.updateMinimap(true);
                    }
                });

            instance.draggable(this.flowchart.nativeElement);

            for (let i = 0; i < windows.length; i++) {
                this.fixEndpoints(windows[i], instance);
            }


            instance.bind("zoom", (val) => {
                instance.repaintEverything();
            });

            // listen for clicks on connections, and offer to delete connections on click.
            instance.bind("click", (conn, originalEvent) => {
                //conn.toggleType("hoverArrow"); //изменить параметры стрелки
            });

            instance.bind("connectionDrag", (connection) => {
                //console.log("connection " + connection.id + " is being dragged. suspendedElement is ", connection.suspendedElement, " of type ", connection.suspendedElementType);
            });

            instance.bind("connectionDragStop", (connection) => {
                //console.log("connection " + connection.id + " was dragged");
            });

            instance.bind("connectionMoved", (params) => {
                //console.log("connection " + params.connection.id + " was moved");
            });
        });

        instance.bind("jsPlumbDemoLoaded", (jsp) => {
            //Auto-layout
            self.rebuildLayout(jsp);
        });

        instance.fire("jsPlumbDemoLoaded", instance);
    }

    RefreshBlocksData(data) {
        if (data.Tasks) {
            for (let i = 0; i < this.blocks.length; i++) {
                for (let j = 0; j < data.Tasks.length; j++) {
                    if (data.Tasks[j].Id == this.blocks[i].task.Id) {
                        this.blocks[i].status = data.Tasks[j].StatusText;
                        this.blocks[i].progress = data.Tasks[j].Progress; //Math.floor(Math.random() * 100);

                        this.blocks[i].task.Status = data.Tasks[j].Status;
                        this.blocks[i].task.StatusText = data.Tasks[j].StatusText;
                        this.blocks[i].task.Progress = data.Tasks[j].Progress;
                        this.blocks[i].task.Inactive = data.Tasks[j].Inactive;
                    }
                }
            }
            try {
                this.cdr.detectChanges();
            } catch (e) {
                console.warn(e);
            }
        }
    }

    public updateSplitterSizes(width, height) {
        this.flowSizeWidth = width;
        this.flowSizeHeight = height;
        if (this.dimensionsBuilded) {
            this.updateMinimap();
            this.updateFrame();
        }
        this.cdr.detectChanges();
    }

    private zoomFlowchart(grow: boolean) {
        let data = {deltaY: 0}
        if (grow) {
            data.deltaY = -1;
        } else {
            data.deltaY = 1;
        }
        this.onScroll(data, 1000);
    }

    private resetFlowChart(full: boolean) {
        if (full) {
            this.rebuildLayout(this.flowChartInstance);
        }
        this.defaultZoom = 5000;
        this.applyZoom(1);
        $(this.flowchart.nativeElement).css('left', 0);
        $(this.flowchart.nativeElement).css('top', 0);
        this.cdr.detectChanges();
        //setTimeout(()=>{
        if (full) {
            this.xOffsetSecond = 0;
            this.yOffsetSecond = 0;
        }
        this.updateFrame();
        //$(this.minimpDrag.nativeElement).css("left", 0);
        //$(this.minimpDrag.nativeElement).css("top", 0);
        this.cdr.detectChanges();
        //});
    }

    private onScroll(data, val = 0) {
        let delta = data.deltaY > 0 ? (val == 0 ? 100 : val) : -(val == 0 ? 100 : val);

        this.defaultZoom -= delta;
        if (this.defaultZoom > 9000)
            this.defaultZoom = 9000;
        if (this.defaultZoom < 1000)
            this.defaultZoom = 1000;

        let zoom = this.defaultZoom / 5000;

        this.applyZoom(zoom);
    }

    private applyZoom(zoom) {
        this.currentZoom = Number((100 * zoom).toFixed(0));
        $(this.flowchart.nativeElement).css({
            "-webkit-transform": "scale(" + zoom + ")",
            "-moz-transform": "scale(" + zoom + ")",
            "-ms-transform": "scale(" + zoom + ")",
            "-o-transform": "scale(" + zoom + ")",
            "transform": "scale(" + zoom + ")"
        });

        let zoomMinimap = $(this.flowchart.nativeElement).outerWidth() / ($(this.flowchart.nativeElement)[0].getBoundingClientRect().right - $(this.flowchart.nativeElement)[0].getBoundingClientRect().left);
        $(this.minimpDrag.nativeElement).css({
            "-webkit-transform": "scale(" + zoomMinimap + ")",
            "-moz-transform": "scale(" + zoomMinimap + ")",
            "-ms-transform": "scale(" + zoomMinimap + ")",
            "-o-transform": "scale(" + zoomMinimap + ")",
            "transform": "scale(" + zoomMinimap + ")"
        });

        //this.flowChartInstance.setZoom(this.defaultZoom / 5000);

        this.updateMinimap();
        this.updateFrame();
    }

    private onBlockClick(block) {
        $(".window").removeClass("selected");
        if (block) {
            $("#flowchart" + block.taskIndex).addClass("selected");
        }
        this.onClickBlock.emit(block ? block.task : null);
    }

    private onBlockDblClick(block) {
        if (block) {
            this.onDblClickBlock.emit(block.task);
        }
    }

    private rebuildLayout(jsPlumbInstance) {
        let g = new dagre.graphlib.Graph();
        //g.setGraph({nodesep: 50, ranksep: 120, marginx: 50, marginy: 50, rankdir: "LR"});
        g.setGraph({
            nodesep: this.nodesep,
            edgesep: this.edgesep,
            ranksep: this.ranksep,
            marginx: this.marginx,
            marginy: this.marginy,
            rankdir: "LR"
        });
        g.setDefaultEdgeLabel(() => {
            return {};
        });

        $('.window').each(
            (idx, node) => {
                let n = $(node);
                g.setNode(n.attr('id'), {
                    width: Math.round(n.outerWidth()),
                    height: Math.round(n.outerHeight())
                });
            }
        );

        jsPlumbInstance.getAllConnections().forEach(
            (edge) => {
                g.setEdge(
                    edge.source.id,
                    edge.target.id
                );
            });

        // calculate the layout (i.e. node positions)
        dagre.layout(g);

        // Applying the calculated layout
        let nodes = g.nodes();

        this.minY = this.setMin(nodes, g, "y", "height");
        this.maxY = this.setMax(nodes, g, "y", "height");
        this.minX = this.setMin(nodes, g, "x", "width");
        this.maxX = this.setMax(nodes, g, "x", "width");

        this.dimensionsBuilded = true;

        this.updateSplitterSizes(this.flowSizeWidth, this.flowSizeHeight);
        this.updateMinimap();

        nodes.forEach(
            (n) => {
                let node = g.node(n);
                let top = Math.round(node.y - node.height / 2);
                let left = Math.round(node.x - node.width / 2);
                $('#' + n).css({left: left + 20 + 'px', top: top + 20 + 'px'});
                $('#mini' + n).css({
                    left: (left) * this.coefW + 'px',
                    top: (top) * this.coefH + 'px',
                    width: node.width * this.coefW + 'px',
                    height: node.height * this.coefH + 'px'
                });
            });

        jsPlumbInstance.repaintEverything();
        setTimeout(() => {
            this.updateMinimap(true);
        });
    }

    private setMin(nodes, g, axis, dimension) {
        return Math.min.apply(Math, nodes.map((o) => {
            let node = g.node(o);
            return Math.round(node[axis] - node[dimension] / 2);
        }));
    }

    private setMax(nodes, g, axis, dimension) {
        return Math.max.apply(Math, nodes.map((o) => {
            let node = g.node(o);
            return Math.round(node[axis] + node[dimension] / 2);
        }));
    }

    private setMinMinimap(nodes, axis, dimension) {
        return Math.min.apply(Math, nodes.map((o) => {
            let node = o;
            return Math.round(node[axis] - node[dimension] / 2);
        }));
    }

    private setMaxMinimap(nodes, axis, dimension) {
        return Math.max.apply(Math, nodes.map((o) => {
            let node = o;
            return Math.round(node[axis] + node[dimension] / 2);
        }));
    }

    private registerEndpoints() {
        // the definition of source endpoints (the small blue ones)
        this.sourceEndpoint = {
            endpoint: "Dot",
            paintStyle: {
                //stroke: "#7AB02C",
                //fill: "transparent",
                fill: "#7AB02C",
                radius: 3,
                strokeWidth: 1
            },
            cssClass: "source-endpoint",
            isSource: true,
            connector: ["StateMachine", {stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true}],
            connectorStyle: this.connectorPaintStyle,
            //hoverPaintStyle: endpointHoverStyle,
            connectorHoverStyle: this.connectorHoverStyle,
            dragOptions: {},
            // overlays: [
            //     ["Label", {
            //         location: [4, -0.4],
            //         label: "Drag",
            //         cssClass: "endpointSourceLabel",
            //         visible: true
            //     }]
            // ],
            enabled: false,
            reattach: false,
            maxConnections: -1
        };

        this.sourceEndpointInactive = {
            endpoint: "Dot",
            paintStyle: {
                fill: "rgba(125, 125, 125, 0.2)",
                radius: 3,
                strokeWidth: 1
            },
            isSource: true,
            connector: ["StateMachine", {stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true}],
            connectorStyle: this.connectorPaintStyleInactive,
            connectorHoverStyle: this.connectorPaintStyleInactive,
            dragOptions: {},
            enabled: false,
            reattach: false,
            maxConnections: -1
        };

        // the definition of target endpoints (will appear when the user drags a connection)
        this.targetEndpoint = {
            endpoint: "Dot",
            paintStyle: {fill: "#7AB02C", radius: 3},
            //hoverPaintStyle: endpointHoverStyle,
            dropOptions: {hoverClass: "hover", activeClass: "active"},
            isTarget: true,
            // overlays: [
            //     ["Label", {location: [-4, -0.5], label: "Drop", cssClass: "endpointTargetLabel", visible: true}]
            // ],
            enabled: false,
            reattach: true,
            maxConnections: -1
        };

        this.targetEndpointInactive = {
            endpoint: "Dot",
            paintStyle: {fill: "rgba(125, 125, 125, 0.2)", radius: 3},
            //hoverPaintStyle: endpointHoverStyle,
            dropOptions: {hoverClass: "hover", activeClass: "active"},
            isTarget: true,
            // overlays: [
            //     ["Label", {location: [-4, -0.5], label: "Drop", cssClass: "endpointTargetLabel", visible: true}]
            // ],
            enabled: false,
            reattach: true,
            maxConnections: -1
        };
    }

    private registerConnectorStyles() {
        this.connectorPaintStyle = {
            strokeWidth: 2,
            stroke: "#61B7CF",
            joinstyle: "round",
        };

        this.connectorPaintStyleInactive = {
            strokeWidth: 2,
            stroke: "rgba(125, 125, 125, 0.2)",
            joinstyle: "round",
        };

        this.connectorHoverStyle = {
            strokeWidth: 2,
            stroke: "#216477",
            joinstyle: "round",
        };

        this.endpointHoverStyle = {
            fill: "#216477",
            stroke: "#216477"
        };
    }

    private fixEndpoints(parentnode, jsPlumbInstance) {

        //get list of current endpoints
        let endpoints = jsPlumbInstance.getEndpoints(parentnode);

        this.calculateEndpoint(endpoints, jsPlumbInstance);

        jsPlumbInstance.repaintEverything();
    }

    private calculateEndpoint(endpointArray, jsPlumbInstance) {
        let r = 0;
        let l = 0;
        let t = 0;
        let b = 0;
        for (let i = 0; i < endpointArray.length; i++) {
            if (endpointArray[i].fixSide) {
                if (endpointArray[i].fixSide == "Right") {
                    r++;
                }
                if (endpointArray[i].fixSide == "Bottom") {
                    b++;
                }
                if (endpointArray[i].fixSide == "Left") {
                    l++;
                }
                if (endpointArray[i].fixSide == "Top") {
                    t++;
                }
            }
        }

        let multR = 1 / (r + 1);
        let multL = 1 / (l + 1);
        let multT = 1 / (t + 1);
        let multB = 1 / (b + 1);

        r = 0;
        l = 0;
        t = 0;
        b = 0;

        for (let i = 0; i < endpointArray.length; i++) {
            if (endpointArray[i].fixSide) {
                if (endpointArray[i].fixSide == "Right") {
                    endpointArray[i].anchor.x = 1;

                    if (endpointArray[i].outputs) {
                        endpointArray[i].anchor.y = 0;
                        endpointArray[i].anchor.offsets = [-4, 26 + 26 * (endpointArray[i].outputId != null ? endpointArray[i].outputId : r) + 13 + 4];
                        if (endpointArray[i].outputId == null)
                            r++;
                    } else {
                        endpointArray[i].anchor.y = multR * (r + 1);
                        r++;
                    }

                }
                if (endpointArray[i].fixSide == "Left") {
                    endpointArray[i].anchor.x = 0;
                    if (endpointArray[i].outputs) {
                        endpointArray[i].anchor.y = 0;
                        endpointArray[i].anchor.offsets = [0, 26 + 26 * (endpointArray[i].outputId != null ? endpointArray[i].outputId : l) + 13];
                        if (endpointArray[i].outputId == null)
                            l++;
                    } else {
                        endpointArray[i].anchor.y = multL * (l + 1);
                        l++;
                    }

                }
                if (endpointArray[i].fixSide == "Top") {
                    endpointArray[i].anchor.x = multT * (t + 1);
                    endpointArray[i].anchor.y = 0;
                    t++;
                }
                if (endpointArray[i].fixSide == "Bottom") {
                    endpointArray[i].anchor.x = multB * (b + 1.5);
                    endpointArray[i].anchor.y = 1;
                    b++;
                }
            }
        }
    }

    private initConnection(connection) {
        connection.getOverlay("label").setLabel(connection.sourceId.substring(15) + "-" + connection.targetId.substring(15));
    }

    private generateEndpoints(jsPlumbInstance, containerId, sourceIds, targetIds, sourceAnchors, targetAnchors,
                              fixSourceAnchors: "Right" | "Left" | "Top" | "Bottom" | null = null,
                              fixTargetAnchors: "Right" | "Left" | "Top" | "Bottom" | null = null,
                              outputs = null, outputId = null, inactive = false) {
        if (fixSourceAnchors == null && sourceIds.length != sourceAnchors.length) {
            console.error("'sourceIds' array must be the same length as 'sourceAnchors'")
        }
        if (fixTargetAnchors == null && targetIds.length != targetAnchors.length) {
            console.error("'targetIds' array must be the same length as 'targetAnchors'")
        }
        for (let i = 0; i < sourceIds.length; i++) {
            let sourceUUID = containerId + sourceIds[i];
            let style = inactive ? this.sourceEndpointInactive : this.sourceEndpoint;
            let anchor = sourceAnchors[i];
            let ep = this.setupEndpointsOnGenerate(anchor, sourceUUID, fixSourceAnchors,
                jsPlumbInstance, containerId, style);
            if (fixSourceAnchors != null) {
                (<any>ep).fixSide = fixSourceAnchors;
                (<any>ep).outputs = outputs;
                (<any>ep).outputId = outputId;
            }
        }
        for (let j = 0; j < targetIds.length; j++) {
            let targetUUID = containerId + targetIds[j];
            let style = inactive ? this.targetEndpointInactive : this.targetEndpoint;
            let anchor = targetAnchors[j];
            let ep = this.setupEndpointsOnGenerate(anchor, targetUUID, fixSourceAnchors,
                jsPlumbInstance, containerId, style);
            if (fixTargetAnchors != null) {
                (<any>ep).fixSide = fixTargetAnchors;
            }
        }
    }

    private setupEndpointsOnGenerate(anchor, sourceUUID, fixSourceAnchors, jsPlumbInstance, containerId, style) {
        let refParams = {anchor: anchor, uuid: sourceUUID};
        if (fixSourceAnchors != null) {
            if (fixSourceAnchors == "Right") {
                refParams.anchor = [1, 0, 1, 0];
            }
            if (fixSourceAnchors == "Left") {
                refParams.anchor = [0, 0, -1, 0];
            }
            if (fixSourceAnchors == "Top") {
                refParams.anchor = [0, 0, 0, -1];
            }
            if (fixSourceAnchors == "Bottom") {
                refParams.anchor = [0, 1, 0, 1];
            }
        }
        return jsPlumbInstance.addEndpoint(containerId, style, refParams);
    }

    private OnDragMinimapStart($event) {
        this.initialX = $event.clientX - this.xOffset;
        this.initialY = $event.clientY - this.yOffset;
        this.active = true;
    }

    private OnDragMinimap($event) {
        if (!this.active)
            return;
        $event.preventDefault();

        this.currentX = $event.clientX - this.initialX;
        this.currentY = $event.clientY - this.initialY;
        this.xOffset = this.currentX;
        this.yOffset = this.currentY;
        this.setTranslate(this.currentX, this.currentY);
        this.updateCanvas();
    }

    private OnDragMinimapEnd($event) {
        this.active = false;
        this.initialX = this.currentX;
        this.initialY = this.currentY;
        this.updateMinimap(true);
    }

    private setTranslate(xPos, yPos) {
        let y = yPos;
        let x = xPos;
        $(this.minimpDrag.nativeElement).css('top', y);
        $(this.minimpDrag.nativeElement).css('left', x);
    }

    private updateMinimap(afterDrag = false) {
        let nodes = []
        if (afterDrag) {
            $('.window').each(
                (idx, node) => {
                    let n = $(node);
                    {
                        nodes.push({
                            width: Math.round(n.outerWidth()),
                            height: Math.round(n.outerHeight()),
                            x: parseInt(n.css('left')) + Math.round(n.outerWidth() / 2),
                            y: parseInt(n.css('top')) + Math.round(n.outerHeight() / 2),
                            id: n.attr('id')
                        });
                    }
                }
            );

            this.minY = this.setMinMinimap(nodes, "y", "height");
            this.maxY = this.setMaxMinimap(nodes, "y", "height");
            this.minX = this.setMinMinimap(nodes, "x", "width");
            this.maxX = this.setMaxMinimap(nodes, "x", "width");
        }

        let w = this.maxX - this.minX;
        let h = this.maxY - this.minY;

        if (w > h) {
            this.coefW = $(this.minimpWrapper.nativeElement).width() / w;
            this.coefH = this.coefW;
        } else {
            this.coefH = $(this.minimpWrapper.nativeElement).height() / h;
            this.coefW = this.coefH;
        }

        $(this.minimpDrag.nativeElement).css("width", this.flowSizeWidth * this.coefW);
        $(this.minimpDrag.nativeElement).css("height", this.flowSizeHeight * this.coefH);

        if (afterDrag) {
            this.xOffsetSecond = 0;
            this.yOffsetSecond = 0;
            if (this.minX < 0) {
                this.xOffsetSecond = Math.round(Math.abs(this.minX) * this.coefW);
            }
            if (this.minY < 0) {
                this.yOffsetSecond = Math.round(Math.abs(this.minY) * this.coefH);
            }
            if (this.minX > 0) {
                this.xOffsetSecond = -Math.round(Math.abs(this.minX) * this.coefW);
            }
            if (this.minY > 0) {
                this.yOffsetSecond = -Math.round(Math.abs(this.minY) * this.coefH);
            }

            nodes.forEach(
                (n) => {
                    let node = n;
                    $('#mini' + n.id).css({
                        left: node.x * this.coefW + (this.xOffsetSecond != 0 ? this.xOffsetSecond - Math.round(node.width / 2 * this.coefW) : 0) + 'px',
                        top: node.y * this.coefH + (this.yOffsetSecond != 0 ? this.yOffsetSecond - Math.round(node.height / 2 * this.coefH) : 0) + 'px',
                        width: node.width * this.coefW + 'px',
                        height: node.height * this.coefH + 'px'
                    });
                });
            this.updateFrame();
        }
    }

    private processScale(data) {
        let scale: number = 1;
        if (data != "none") {
            let values = data.split('(')[1];
            values = values.split(')')[0];
            let resvalues = values.split(',');
            scale = parseFloat(resvalues[0]);
        }
        return scale;
    }

    private updateFrame() {
        let wrapperX = -parseInt($(this.flowchart.nativeElement).css('left'));
        let wrapperY = -parseInt($(this.flowchart.nativeElement).css('top'));
        let wrapperW = $(this.flowchart.nativeElement).outerWidth();
        let wrapperH = $(this.flowchart.nativeElement).outerHeight();

        let data = $(this.flowchart.nativeElement).css("transform");
        let scale = this.processScale(data);

        let l = Math.round(wrapperX * -1 - (this.xOffsetSecond != 0 ? ((this.xOffsetSecond / this.coefW)) : 0));
        let t = Math.round(wrapperY * -1 - (this.yOffsetSecond != 0 ? ((this.yOffsetSecond / this.coefH)) : 0));
        let w = Math.round(wrapperW);
        let h = Math.round(wrapperH);

        let gW = (Math.abs(this.minX) + Math.abs(this.maxX)) * scale;
        let gH = (Math.abs(this.minY) + Math.abs(this.maxY)) * scale;

        let offX = (wrapperW - w * scale);
        let offY = (wrapperH - h * scale);

        if (l + offX < 0 || t + offY < 0 || l + offX + gW > w || t + offY + gH > h) {
            this.minimapShowed = true;
        } else {
            this.minimapShowed = false;
        }
        this.minimapShowed = true;
        data = $(this.minimpDrag.nativeElement).css("transform");
        scale = 1;
        if (data != "none") {
            let values = data.split('(')[1];
            values = values.split(')')[0];
            let resvalues = values.split(',');
            scale = parseFloat(resvalues[0]);
        }
        $(this.minimpDrag.nativeElement).css({
            left: Math.round(wrapperX * this.coefW * scale + this.xOffsetSecond) + 'px',
            top: Math.round(wrapperY * this.coefH * scale + this.yOffsetSecond) + 'px',
        });

        this.initialX = parseInt($(this.minimpDrag.nativeElement).css('left'));
        this.initialY = parseInt($(this.minimpDrag.nativeElement).css('top'));
        this.xOffset = this.initialX;
        this.yOffset = this.initialY;
    }

    private updateCanvas() {
        let frameX = -parseInt($(this.minimpDrag.nativeElement).css('left'));
        let frameY = -parseInt($(this.minimpDrag.nativeElement).css('top'));

        let data = $(this.minimpDrag.nativeElement).css("transform");
        let scale = this.processScale(data);

        $(this.flowchart.nativeElement).css({
            left: Math.round(frameX / this.coefW / scale + this.xOffsetSecond / this.coefW) + 'px',
            top: Math.round(frameY / this.coefH / scale + this.yOffsetSecond / this.coefH) + 'px',
        });
    }
}
