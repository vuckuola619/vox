import pytest
from src.script_writer import VoxScriptWriter, VoxScriptBlueprint

def test_native_script_generation():
    writer = VoxScriptWriter()
    blueprint = writer.generate_script(topic="Quantum Computing", duration_seconds=30)

    assert isinstance(blueprint, VoxScriptBlueprint)
    assert blueprint.topic == "Quantum Computing"
    assert len(blueprint.scenes) > 0
    assert blueprint.scenes[0].scene_index == 1
    assert blueprint.scenes[0].narration_text != ""
    assert blueprint.scenes[0].kinetic_heading != ""
    assert blueprint.scenes[0].imagen_prompt != ""
