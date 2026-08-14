import json
import logging
import os
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from src.config import Config
from src.token_saver import ContextCacheManager, PromptCompressor

logger = logging.getLogger(__name__)

class VoxScene(BaseModel):
    scene_index: int
    narration_text: str = Field(description="Exact spoken narration sentence.")
    kinetic_heading: str = Field(description="Condensed bold headline label in ALL CAPS (1-4 words).")
    imagen_prompt: str = Field(description="Full documentary paper-collage visual prompt.")
    lower_third: Optional[str] = Field(default=None, description="Typewriter caption strip or stamp text.")
    highlight_words: List[str] = Field(default_factory=list, description="Key words for hot red or mustard yellow highlight.")
    transition_style: str = Field(default="ken_burns_in", description="Visual motion style: classic, kinetic, deep_diorama, paper_tear, map_pin.")
    motion_graphics_overlay: Optional[Dict[str, Any]] = Field(default=None, description="Motion graphics configuration object for Remotion overlays (route_tracer, chokepoint_ruler, map_highlight, stat_callout).")

class VoxScriptBlueprint(BaseModel):
    title: str
    topic: str
    target_duration_seconds: int
    scenes: List[VoxScene]

class VoxScriptWriter:
    """Generates structured Vox-style paper collage documentary script blueprints."""

    def __init__(self, cache_manager: Optional[ContextCacheManager] = None):
        self.cache_manager = cache_manager or ContextCacheManager()

    def generate_script(self, topic: str, duration_seconds: int = 120, custom_blueprint_path: Optional[str] = None) -> VoxScriptBlueprint:
        """Generate a structured paper-collage video script blueprint for a given topic."""
        if custom_blueprint_path:
            with open(custom_blueprint_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return VoxScriptBlueprint(**data)

        cached_data = self.cache_manager.get_cached_script(topic, mode=str(duration_seconds))
        if cached_data:
            logger.info(f"Loaded script blueprint for '{topic}' from token saver cache.")
            return VoxScriptBlueprint(**cached_data)

        blueprint = self._generate_vox_paper_script(topic, duration_seconds)
        self.cache_manager.save_script(topic, mode=str(duration_seconds), data=blueprint.model_dump())
        return blueprint

    def _generate_vox_paper_script(self, topic: str, duration_seconds: int) -> VoxScriptBlueprint:
        """Generate script adhering to Vox documentary DNA for any given topic."""
        clean_topic = topic.strip().title()
        upper_topic = clean_topic.upper()

        base_scenes = [
            VoxScene(
                scene_index=1,
                narration_text=f"Behind the surface of modern society lies {clean_topic}, a hidden force that quietly reshaped history.",
                kinetic_heading=f"THE ORIGIN OF {upper_topic}",
                imagen_prompt=f"A halftone black and white photograph cutout representing {clean_topic} with rough scissor-cut edges and a red offset stroke, set on aged newsprint, {Config.STYLE_BLOCK}",
                lower_third=f"CASE FILE: {upper_topic} ORIGINS",
                highlight_words=[clean_topic.split()[0], "force", "history"],
                transition_style="ken_burns_in",
                motion_graphics_overlay={"type": "map_highlight", "label": f"{upper_topic} HUB", "coords": "37.7° N, 122.4° W"}
            ),
            VoxScene(
                scene_index=2,
                narration_text=f"What few people realize is that {clean_topic} relies on a single critical chokepoint controlled by only a handful of key players.",
                kinetic_heading="THE CHOKEPOINT",
                imagen_prompt=f"A torn paper document cutout showing a technical schematic diagram of {clean_topic}, red string pinned between key nodes, rubber stamp mark reading CONFIDENTIAL, {Config.STYLE_BLOCK}",
                lower_third="ANALYSIS: MONOPOLY RISKS",
                highlight_words=["chokepoint", "controlled"],
                transition_style="paper_tear",
                motion_graphics_overlay={"type": "chokepoint_ruler", "width": "2.8 KM (PRIMARY CHOKEPOINT)"}
            ),
            VoxScene(
                scene_index=3,
                narration_text=f"When demand for {clean_topic} surged, global supply chains reached a breaking point, sparking unprecedented disruption worldwide.",
                kinetic_heading="THE CRISIS",
                imagen_prompt=f"A massive stat counter reading 100 BILLION in condensed bold red numbers, surrounded by black and white halftone industrial cutouts, {Config.STYLE_BLOCK}",
                lower_third=f"IMPACT: {upper_topic} DISRUPTIONS",
                highlight_words=["surged", "disruption"],
                transition_style="kinetic",
                motion_graphics_overlay={"type": "stat_callout", "stat": "GLOBAL DEMAND SURGE", "value": "100 BILLION UNITS"}
            ),
            VoxScene(
                scene_index=4,
                narration_text=f"Global superpowers began investing hundreds of billions into securing local dominance over {clean_topic}.",
                kinetic_heading="GEOPOLITICAL RACE",
                imagen_prompt=f"An archival world map surface with red yarn stretched between brass pins connecting supply nodes of {clean_topic}, paper tape fragments, {Config.STYLE_BLOCK}",
                lower_third="GLOBAL STRATEGY MAP",
                highlight_words=["superpowers", "dominance"],
                transition_style="map_pin",
                motion_graphics_overlay={"type": "route_tracer", "distance": "5,800 NAUTICAL MILES"}
            ),
            VoxScene(
                scene_index=5,
                narration_text=f"Researchers and engineers are now pushing {clean_topic} to its absolute physical limits.",
                kinetic_heading="PHYSICAL LIMITS",
                imagen_prompt=f"A black and white halftone cutout of microscopic structures in {clean_topic} with a bright mustard yellow highlight circle drawn around the core, {Config.STYLE_BLOCK}",
                lower_third="PHYSICS BOUNDARY",
                highlight_words=["limits", "engineers"],
                transition_style="deep_diorama",
                motion_graphics_overlay={"type": "map_highlight", "label": "PHYSICAL ATOMIC BOUNDARY", "coords": "2.0 NANOMETERS"}
            ),
            VoxScene(
                scene_index=6,
                narration_text=f"As the race accelerates, the ultimate outcome of {clean_topic} remains one of the most critical unanswered questions of our era.",
                kinetic_heading="THE UNRESOLVED FUTURE",
                imagen_prompt=f"A lonely archival cardboard box cutout with a bold red REJECTED rubber stamp, masking tape fragments on aged newsprint, {Config.STYLE_BLOCK}",
                lower_third="CLASSIFIED ENDING",
                highlight_words=["race", "unanswered", "era"],
                transition_style="paper_tear",
                motion_graphics_overlay={"type": "stat_callout", "stat": "UNRESOLVED FUTURE", "value": "STAKE: GLOBAL SUPREMACY"}
            )
        ]

        if duration_seconds <= 45:
            selected_scenes = base_scenes[:3]
        elif duration_seconds <= 75:
            selected_scenes = base_scenes[:4]
        else:
            selected_scenes = base_scenes

        return VoxScriptBlueprint(
            title=f"The Secret World of {clean_topic}",
            topic=clean_topic,
            target_duration_seconds=duration_seconds,
            scenes=selected_scenes
        )

    def generate_longform_levels(self, topic: str) -> List[Dict[str, Any]]:
        """Generate 6 detailed Chapter Levels for a 12-15 minute long-form Vox documentary."""
        return [
            {
                "level_number": 1,
                "level_title": "LEVEL 1: THE INITIAL SPARK",
                "level_summary": "The origin story of silicon fabrication and the initial breakthrough.",
                "frames": [
                    {
                        "frame_index": 1,
                        "narration_text": "March 14, 1987. A quiet laboratory in Silicon Valley. Engineers test a thin piece of purified silicon that would change global power forever.",
                        "kinetic_heading": "THE INITIAL SPARK",
                        "lower_third": "FIG 1. SILICON VALLEY, 1987",
                        "highlight_words": ["1987", "silicon", "power"],
                        "transition_style": "ken_burns_in",
                        "imagen3_prompt": "A halftone black and white photograph cutout of a 1980s scientist holding a microchip wafer with rough scissor-cut edges and a red offset stroke, paper collage."
                    },
                    {
                        "frame_index": 2,
                        "narration_text": "To understand how semiconductors conquered the planet, we have to look inside the microscopic architecture of modern transistors.",
                        "kinetic_heading": "MICROSCOPIC POWER",
                        "lower_third": "CHAPTER 1. TRANSISTOR ARCHITECTURE",
                        "highlight_words": ["semiconductors", "transistors"],
                        "transition_style": "paper_tear",
                        "imagen3_prompt": "A torn paper document cutout showing microscopic silicon transistor gates, red line highlights, paper collage on aged newsprint."
                    }
                ]
            },
            {
                "level_number": 2,
                "level_title": "LEVEL 2: THE SECRET MONOPOLIES",
                "level_summary": "How a single Dutch factory in Veldhoven came to dominate 99% of global advanced lithography.",
                "frames": [
                    {
                        "frame_index": 1,
                        "narration_text": "Behind closed doors in Veldhoven, Netherlands, a single Dutch company named ASML was quietly constructing the most complex machines in human history.",
                        "kinetic_heading": "THE VELDHOVEN CLEANROOM",
                        "lower_third": "CASE FILE: ASML HEADQUARTERS",
                        "highlight_words": ["Veldhoven", "ASML", "machines"],
                        "transition_style": "ken_burns_in",
                        "imagen3_prompt": "A black and white halftone photograph cutout of ASML cleanroom engineers in white hazmat suits surrounding an EUV lithography machine with scissor-cut white keyline edge, offset red stroke, paper collage on aged newsprint."
                    },
                    {
                        "frame_index": 2,
                        "narration_text": "These Extreme Ultraviolet lithography systems bounce high-energy laser beams off ultra-precise mirrors polished to within atomic-scale tolerances.",
                        "kinetic_heading": "EUV MIRROR PRECISION",
                        "lower_third": "OPTICAL TOLERANCE: 0.1 NANOMETER",
                        "highlight_words": ["Ultraviolet", "lasers", "mirrors"],
                        "transition_style": "paper_tear",
                        "imagen3_prompt": "A torn paper document cutout of Carl Zeiss EUV mirror optics diagrams with red laser path highlights, paper collage on aged newsprint."
                    },
                    {
                        "frame_index": 3,
                        "narration_text": "Every advanced smartphone, supercomputer, and AI accelerator on Earth relies on this single assembly line. If it stops, global technology stalls.",
                        "kinetic_heading": "SINGLE POINT FAILURE",
                        "lower_third": "GLOBAL CHOKEPOINT: 99% MONOPOLY",
                        "highlight_words": ["smartphone", "accelerator", "stalls"],
                        "transition_style": "deep_diorama",
                        "imagen3_prompt": "Archival world map cutout showing a red pin marker on Veldhoven with red yarn connecting global tech hubs, paper collage."
                    },
                    {
                        "frame_index": 4,
                        "narration_text": "Shipping just one of these multi-hundred-million-dollar machines requires three Boeing 747 cargo jets and over forty shipping containers.",
                        "kinetic_heading": "LOGISTICAL BEHEMOTH",
                        "lower_third": "CARGO CAPACITY: 3 BOEING 747S",
                        "highlight_words": ["machines", "Boeing", "containers"],
                        "transition_style": "ken_burns_out",
                        "imagen3_prompt": "Halftone cargo plane cutout loading massive EUV machine crates with bold red TOP SECRET rubber stamps, paper collage."
                    },
                    {
                        "frame_index": 5,
                        "narration_text": "With sovereign dominance at stake, these cleanrooms are protected by military-grade cybersecurity and strict nation-state espionage defense.",
                        "kinetic_heading": "DEFENSE SHIELD",
                        "lower_third": "SECURITY LEVEL: CLASSIFIED",
                        "highlight_words": ["sovereign", "cybersecurity", "espionage"],
                        "transition_style": "paper_tear",
                        "imagen3_prompt": "Archival cardboard document file cutout with red REJECTED rubber stamp and red string wiretaps, paper collage."
                    },
                    {
                        "frame_index": 6,
                        "narration_text": "This extreme concentration of manufacturing power created an unprecedented vulnerability in the global economy, setting the stage for the crisis to come.",
                        "kinetic_heading": "MONOPOLY CRISIS",
                        "lower_third": "CHAPTER 2 RECAPITULATION",
                        "highlight_words": ["vulnerability", "economy", "crisis"],
                        "transition_style": "deep_diorama",
                        "imagen3_prompt": "Torn newsprint paper collage with microchip wafer silhouettes and red offset drop shadow accents."
                    }
                ]
            },
            {
                "level_number": 3,
                "level_title": "LEVEL 3: THE $500B SHORTAGE",
                "level_summary": "The exponential surge in demand and the global crisis of 2020.",
                "frames": [
                    {
                        "frame_index": 1,
                        "narration_text": "By 2020, as the world locked down, consumer demand for laptops, servers, and gaming consoles exploded exponentially overnight.",
                        "kinetic_heading": "EXPONENTIAL EXPLOSION",
                        "lower_third": "STAT: 500 BILLION UNITS",
                        "highlight_words": ["exploded", "shortage", "overnight"],
                        "transition_style": "kinetic",
                        "imagen3_prompt": "A giant stat counter reading 500 BILLION in condensed bold red numbers, surrounded by cargo container cutouts, paper collage."
                    },
                    {
                        "frame_index": 2,
                        "narration_text": "In Detroit, Wolfsburg, and Toyota City, multi-billion-dollar car factories ground to a sudden halt for lack of a two-dollar microcontroller.",
                        "kinetic_heading": "AUTOMOTIVE PARALYSIS",
                        "lower_third": "FACTORY SHUTDOWN: 10 MILLION VEHICLES",
                        "highlight_words": ["factories", "microcontroller", "halt"],
                        "transition_style": "paper_tear",
                        "imagen3_prompt": "Halftone black and white photograph cutout of an empty robotic automobile assembly line with red STOP SIGN overlay, paper collage."
                    },
                    {
                        "frame_index": 3,
                        "narration_text": "Tech giants and defense contractors panicked, placing double and triple phantom orders that artificially bloated lead times to fifty-two weeks.",
                        "kinetic_heading": "PHANTOM DEMAND",
                        "lower_third": "DELIVERY LEAD TIME: 52 WEEKS",
                        "highlight_words": ["phantom", "orders", "weeks"],
                        "transition_style": "deep_diorama",
                        "imagen3_prompt": "Archival paper document cutout showing red lead-time charts spiking to 52 WEEKS with panic order stamps, paper collage."
                    },
                    {
                        "frame_index": 4,
                        "narration_text": "Empty retail shelves, scalped graphics cards, and soaring inflation revealed how completely fragile the modern just-in-time supply chain had become.",
                        "kinetic_heading": "SUPPLY CHAIN FALLOUT",
                        "lower_third": "INFLATION SURGE: GLOBAL CRISIS",
                        "highlight_words": ["shelves", "inflation", "fragile"],
                        "transition_style": "ken_burns_out",
                        "imagen3_prompt": "Torn paper document cutout of empty store shelves with red INFLATION graph line overlay, paper collage on aged newsprint."
                    },
                    {
                        "frame_index": 5,
                        "narration_text": "Sovereign nations realized that control of raw silicon wafers was no longer just a business transaction, but a matter of national survival.",
                        "kinetic_heading": "SILICON SURVIVAL",
                        "lower_third": "RAW MATERIAL WAFER SHORTAGE",
                        "highlight_words": ["silicon", "survival", "national"],
                        "transition_style": "paper_tear",
                        "imagen3_prompt": "Black and white halftone cutout of raw silicon ingots glowing red under extreme heat, with red top secret paper tags, paper collage."
                    },
                    {
                        "frame_index": 6,
                        "narration_text": "The half-trillion-dollar shortage proved that whoever controls microchips commands the global economy, setting off an all-out superpower arms race.",
                        "kinetic_heading": "THE $500B LESSON",
                        "lower_third": "CHAPTER 3 RECAPITULATION",
                        "highlight_words": ["shortage", "economy", "superpower"],
                        "transition_style": "deep_diorama",
                        "imagen3_prompt": "Torn newsprint collage with bold red $500 BILLION text, microchip wafer silhouettes, and red drop shadow accents."
                    }
                ]
            },
            {
                "level_number": 4,
                "level_title": "LEVEL 4: GEOPOLITICAL COLLISION",
                "level_summary": "Superpower competition and domestic fab subsidies.",
                "frames": [
                    {
                        "frame_index": 1,
                        "narration_text": "Recognizing technological dependence as a national security risk, Washington passed the fifty-two billion dollar CHIPS and Science Act to rebuild domestic semiconductor manufacturing.",
                        "kinetic_heading": "GEOPOLITICAL RACE",
                        "lower_third": "CHIPS ACT: $52 BILLION SUBSIDY",
                        "highlight_words": ["dependence", "manufacturing", "Washington"],
                        "transition_style": "map_pin",
                        "imagen3_prompt": "Archival paper document cutout of the US Capitol building with bold red $52 BILLION CHIPS ACT stamp, paper collage on aged newsprint."
                    },
                    {
                        "frame_index": 2,
                        "narration_text": "Meanwhile, in Hsinchu, Taiwan, TSMC stood at the eye of the storm, producing over ninety percent of the world's most advanced microchips inside a geopolitical fortress.",
                        "kinetic_heading": "SILICON SHIELD",
                        "lower_third": "TAIWAN FAB DOMINANCE: 90% ADVANCED CHIPS",
                        "highlight_words": ["TSMC", "fortress", "Taiwan"],
                        "transition_style": "paper_tear",
                        "imagen3_prompt": "Halftone black and white photograph cutout of TSMC fab cleanrooms surrounded by Taiwan map outlines with red protective shield lines, paper collage."
                    },
                    {
                        "frame_index": 3,
                        "narration_text": "Strict export controls banned advanced EUV machinery shipments to rival nations, turning high-tech manufacturing equipment into a weapon of economic warfare.",
                        "kinetic_heading": "EXPORT SANCTIONS",
                        "lower_third": "SECURITY BARRIER: EUV EXPORT RESTRICTIONS",
                        "highlight_words": ["export", "sanctions", "warfare"],
                        "transition_style": "deep_diorama",
                        "imagen3_prompt": "Archival cardboard document file cutout with red EXPORT BANNED rubber stamp and chain locks across EUV machinery diagrams, paper collage."
                    },
                    {
                        "frame_index": 4,
                        "narration_text": "In the Arizona desert, cranes and construction crews broke ground on massive mega-fabs, attempting to replicate decades of specialized manufacturing ecosystems overnight.",
                        "kinetic_heading": "DESERT MEGA-FABS",
                        "lower_third": "ARIZONA SITE: $40B INVESTMENT",
                        "highlight_words": ["Arizona", "mega-fabs", "cranes"],
                        "transition_style": "ken_burns_out",
                        "imagen3_prompt": "Halftone cutout of massive construction cranes building a semiconductor mega-fab in the Arizona desert with red architectural grid overlays, paper collage."
                    },
                    {
                        "frame_index": 5,
                        "narration_text": "Yet money alone could not solve the crisis: finding hundreds of thousands of specialized cleanroom engineers and millions of gallons of ultra-pure water presented immense bottlenecks.",
                        "kinetic_heading": "RESOURCE BOTTLENECK",
                        "lower_third": "CHALLENGE: 100K ENGINEERS & ULTRA-PURE WATER",
                        "highlight_words": ["engineers", "water", "bottlenecks"],
                        "transition_style": "paper_tear",
                        "imagen3_prompt": "Torn paper document cutout showing cleanroom water filtration pipes and technical diploma cutouts with red CRITICAL BOTTLENECK stamps, paper collage."
                    },
                    {
                        "frame_index": 6,
                        "narration_text": "As nations fractured the global supply chain into sovereign technological fortresses, the era of cheap, frictionless microchip production came to an abrupt end.",
                        "kinetic_heading": "SOVEREIGN FORTRESSES",
                        "lower_third": "CHAPTER 4 RECAPITULATION",
                        "highlight_words": ["fortresses", "frictionless", "abrupt"],
                        "transition_style": "deep_diorama",
                        "imagen3_prompt": "Archival world map torn into sovereign technological zones with red string wiretaps and microchip wafer silhouettes, paper collage on newsprint."
                    }
                ]
            },
            {
                "level_number": 5,
                "level_title": "LEVEL 5: THE ATOMIC CEILING",
                "level_summary": "Quantum tunneling and the physical boundaries of silicon.",
                "frames": [
                    {
                        "frame_index": 1,
                        "narration_text": "As semiconductor fabrication shrinks down to two nanometers, a single transistor gate becomes only ten silicon atoms wide.",
                        "kinetic_heading": "ATOMIC BOUNDARY",
                        "lower_third": "PHYSICS LIMIT: 2 NANOMETERS",
                        "highlight_words": ["transistor", "nanometers", "atoms"],
                        "transition_style": "ken_burns_in",
                        "imagen3_prompt": "Scissor-cut 2nm silicon atomic grid diagram with red offset stroke and newsprint background."
                    },
                    {
                        "frame_index": 2,
                        "narration_text": "At this subatomic scale, quantum mechanics takes over: electrons literally warp through solid barriers via quantum tunneling, causing massive energy leakage.",
                        "kinetic_heading": "QUANTUM LEAKAGE",
                        "lower_third": "SUBATOMIC EFFECT: QUANTUM TUNNELING",
                        "highlight_words": ["quantum", "tunneling", "electrons"],
                        "transition_style": "paper_tear",
                        "imagen3_prompt": "Subatomic electron quantum tunneling wave-particle schematic with red energy leap vectors and CLASSIFIED stamps."
                    },
                    {
                        "frame_index": 3,
                        "narration_text": "To trap these rogue electrons, engineers abandoned flat transistors in favor of Gate-All-Around 3D nanosheets, wrapping control gates around silicon channels on all four sides.",
                        "kinetic_heading": "3D NANOSHEET ARCHITECTURE",
                        "lower_third": "GAAFET TRANSISTORS: 360-DEGREE CONTROL",
                        "highlight_words": ["GAAFET", "nanosheets", "channels"],
                        "transition_style": "deep_diorama",
                        "imagen3_prompt": "GAAFET 3D nanosheet transistor architecture cutouts with 360-degree gate wrap lines and yellow/red highlight rings."
                    },
                    {
                        "frame_index": 4,
                        "narration_text": "Shooting sub-nanometer circuitry requires Next-Gen High-NA EUV machines costing three hundred and fifty million dollars, consuming immense electrical power and generating scorching thermal heat.",
                        "kinetic_heading": "HIGH-NA EUV THERMODYNAMICS",
                        "lower_third": "MACHINE COST: $350M PER UNIT",
                        "highlight_words": ["High-NA", "thermodynamics", "million"],
                        "transition_style": "ken_burns_out",
                        "imagen3_prompt": "High-NA EUV $350M machine blueprint cutout with thermal heat gradient overlays and TOP SECRET stamps."
                    },
                    {
                        "frame_index": 5,
                        "narration_text": "For sixty years, Moore's Law predicted that computing power would double every two years while costs halved. Today, that economic law has hit a brick wall.",
                        "kinetic_heading": "MOORE'S LAW COLLAPSE",
                        "lower_third": "ECONOMIC WALL: COSTS ESCALATING",
                        "highlight_words": ["Moore's", "collapse", "predicted"],
                        "transition_style": "paper_tear",
                        "imagen3_prompt": "Moore's Law exponential curve crashing into a red brick wall graphic with 1965-2026 timelines."
                    },
                    {
                        "frame_index": 6,
                        "narration_text": "As physical silicon hits its absolute atomic ceiling, the global race is shifting toward advanced 3D packaging and the dawn of quantum computing.",
                        "kinetic_heading": "THE ATOMIC CEILING",
                        "lower_third": "CHAPTER 5 RECAPITULATION",
                        "highlight_words": ["ceiling", "quantum", "packaging"],
                        "transition_style": "deep_diorama",
                        "imagen3_prompt": "3D Chiplet Wafer Stack and Quantum Qubit state cutouts with red paper tape and vintage newspaper collage."
                    }
                ]
            },
            {
                "level_number": 6,
                "level_title": "LEVEL 6: THE UNRESOLVED FUTURE",
                "level_summary": "The cliffhanger ending and the race for quantum supremacy.",
                "frames": [
                    {
                        "frame_index": 1,
                        "narration_text": "Behind closed doors in elite research centers, humanity stands at a monumental crossroads: the era of silicon scaling is ending, but what comes next will redefine civilization.",
                        "kinetic_heading": "THE CROSSROADS",
                        "lower_third": "DOCUMENTARY CONCLUSION: MONUMENTAL ERA",
                        "highlight_words": ["crossroads", "silicon", "civilization"],
                        "transition_style": "paper_tear",
                        "imagen3_prompt": "A lonely archival cardboard box cutout with bold red REJECTED and CLASSIFIED rubber stamps, paper collage on aged newsprint."
                    },
                    {
                        "frame_index": 2,
                        "narration_text": "With single points of failure scattered across vulnerable geographical chokepoints, a single conflict or natural disaster could halt global computation overnight.",
                        "kinetic_heading": "VULNERABLE CHOKEPOINTS",
                        "lower_third": "SYSTEMIC RISK: GEOGRAPHIC CONCENTRATION",
                        "highlight_words": ["vulnerable", "chokepoints", "overnight"],
                        "transition_style": "map_pin",
                        "imagen3_prompt": "Archival global map with red target reticles over key semiconductor fab locations and warning stamps, paper collage on aged newsprint."
                    },
                    {
                        "frame_index": 3,
                        "narration_text": "Yet from artificial intelligence to sovereign cryptography, every modern miracle depends on these microscopic chips of purified sand.",
                        "kinetic_heading": "THE SILICON ENGINE",
                        "lower_third": "FOUNDATION: ARTIFICIAL INTELLIGENCE & CRITICAL DATA",
                        "highlight_words": ["intelligence", "cryptography", "sand"],
                        "transition_style": "deep_diorama",
                        "imagen3_prompt": "Halftone cutout of modern smartphone and AI server rack components with glowing red microchip core and silicon wafer collage, paper collage on aged newsprint."
                    },
                    {
                        "frame_index": 4,
                        "narration_text": "Scientists are racing to unlock quantum supremacy, building dilution refrigerators cooled to near absolute zero to harness the power of superposition.",
                        "kinetic_heading": "QUANTUM SUPREMACY",
                        "lower_third": "FRONTIER: CRYOGENIC QUBIT SUPERCOMPUTERS",
                        "highlight_words": ["quantum", "supremacy", "superposition"],
                        "transition_style": "ken_burns_in",
                        "imagen3_prompt": "Dilution refrigerator quantum supercomputer cutout with golden wiring coils and glowing blue-red qubit lattice, paper collage on newsprint."
                    },
                    {
                        "frame_index": 5,
                        "narration_text": "Whoever controls the next computing paradigm will hold the master key to global economic power, national defense, and artificial superintelligence.",
                        "kinetic_heading": "THE MASTER KEY",
                        "lower_third": "STAKES: ECONOMIC POWER & SUPERINTELLIGENCE",
                        "highlight_words": ["paradigm", "master", "superintelligence"],
                        "transition_style": "paper_tear",
                        "imagen3_prompt": "Torn world map showing two separated technological superpowers with red laser wall barrier between them, paper collage on newsprint."
                    },
                    {
                        "frame_index": 6,
                        "narration_text": "The secret war for quantum supremacy has only just begun. The question is no longer if the paradigm will shift, but who will dominate the new era.",
                        "kinetic_heading": "THE UNRESOLVED FUTURE",
                        "lower_third": "FINAL QUESTION: THE NEXT ERA",
                        "highlight_words": ["secret", "supremacy", "dominate"],
                        "transition_style": "deep_diorama",
                        "imagen3_prompt": "Archival cardboard file folder with big red QUESTION MARK rubber stamp and glowing quantum microchip, paper collage on aged newsprint."
                    }
                ]
            }
        ]
