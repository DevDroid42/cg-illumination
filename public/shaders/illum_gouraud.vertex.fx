#version 300 es
precision highp float;

// Attributes
in vec3 position;
in vec3 normal;
in vec2 uv;

// Uniforms
// projection 3D to 2D
uniform mat4 world;
uniform mat4 view;
uniform mat4 projection;
// material
uniform vec2 texture_scale;
uniform float mat_shininess;
// camera
uniform vec3 camera_position;
// lights
uniform int num_lights;
uniform vec3 light_positions[8];
uniform vec3 light_colors[8]; // Ip

// Output
out vec2 model_uv;
out vec3 diffuse_illum;
out vec3 specular_illum;

void main()
{
    // Pass diffuse and specular illumination onto the fragment shader
    diffuse_illum = vec3(0.0, 0.0, 0.0);
    specular_illum = vec3(0.0, 0.0, 0.0);
    vec4 world_pos = world * vec4(position, 1.0);
    vec3 light_vector = light_positions[0] - world_pos.xyz;
    vec3 normalizedNormal = normalize(normal);
    light_vector = normalize(light_vector);
    diffuse_illum = max(dot(normalizedNormal, light_vector), 0.0) * light_colors[0];
    
    vec3 specular_view = normalize(camera_position - world_pos.xyz);
    vec3 reflection = reflect(-light_vector, normalizedNormal);
    specular_illum = min(pow(max(dot(specular_view, reflection), 0.0), mat_shininess) * light_colors[0], 1.0);
    
    //Pass vertex texcoord onto the fragment shader
    model_uv = uv;
    // model_uv = vec2(world_pos.x, world_pos.z);

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * world_pos;
}
