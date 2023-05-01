#version 300 es
precision highp float;

// Attributes
in vec3 position;
in vec2 uv;

// Uniforms
// projection 3D to 2D
uniform mat4 world;
uniform mat4 view;
uniform mat4 projection;
// height displacement
uniform vec2 ground_size;
uniform float height_scalar;
uniform sampler2D heightmap;
// material
uniform vec2 texture_scale;

// Output
out vec3 model_normal;
out vec2 model_uv;
out vec3 frag_pos;

void main() {
    // Get initial position of vertex (prior to height displacement)
    vec4 world_pos = world * vec4(position, 1.0);
    world_pos.y += (texture(heightmap, uv).x - 0.5) * 2.0 * height_scalar;

    model_normal = vec3(0.0, 1.0, 0.0);
    vec3 neighbor1 = position;
    neighbor1.x += 2.0;
    vec2 neighbor1Sample = uv;
    neighbor1Sample.x += (2.0 / ground_size.x);
    neighbor1.y = (texture(heightmap, neighbor1Sample).x - 0.5) * 2.0 * height_scalar;
    
    vec3 neighbor2 = position;
    neighbor2.z += 2.0;
    vec2 neighbor2Sample = uv;
    neighbor2Sample.y += (2.0 / ground_size.y);
    neighbor2.y = (texture(heightmap, neighbor2Sample).x - 0.5) * 2.0 * height_scalar;

    vec3 tangent = neighbor1 - position;
    vec3 biTangent = neighbor2 - position;
    vec3 normal = normalize(cross(biTangent, tangent));
    model_normal = normal;

    frag_pos = vec3(view * vec4(position, 1.0));
    // Pass vertex normal onto the fragment shader
    
    // Pass vertex texcoord onto the fragment shader
    model_uv = uv;

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * world_pos;
}
