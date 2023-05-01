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
uniform float mat_shininess;
uniform vec2 texture_scale;
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
    // Get initial position of vertex (prior to height displacement)
    vec4 world_pos = world * vec4(position, 1.0);
    world_pos.y += (texture(heightmap, uv).x - 0.5) * 2.0;

    vec3 neighbor1 = position;
    neighbor1.x += 0.1;
    vec2 neighbor1Sample = uv;
    neighbor1Sample.x += (0.1 / ground_size.x);
    neighbor1.y = (texture(heightmap, neighbor1Sample).x - 0.5) * 2.0;
    
    vec3 neighbor2 = position;
    neighbor2.z += 0.1;
    vec2 neighbor2Sample = uv;
    neighbor2Sample.y += (0.1 / ground_size.y);
    neighbor2.y = (texture(heightmap, neighbor2Sample).x - 0.5) * 2.0;

    vec3 tangent = neighbor1 - position;
    vec3 biTangent = neighbor2 - position;
    vec3 normal = normalize(cross(biTangent, tangent));

    // Pass diffuse and specular illumination onto the fragment shader
    diffuse_illum = vec3(0.0, 0.0, 0.0);
    specular_illum = vec3(0.0, 0.0, 0.0);
    vec3 light_vector = light_positions[0] - world_pos.xyz;
    vec3 normalizedNormal = normalize(normal);
    light_vector = normalize(light_vector);
    //diffuse_illum = max(dot(normalizedNormal, light_vector), 0.0) * light_colors[0];
    
    vec3 V = normalize(camera_position - world_pos.xyz);
    vec3 R = max(2.0 * dot(normalizedNormal, light_vector) * normalizedNormal, 0.0) - light_vector;
    specular_illum = pow(max(dot(R, V), 0.0), mat_shininess) * light_colors[0];

    // Pass vertex texcoord onto the fragment shader
    model_uv = uv;
    specular_illum = normal;

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * world_pos;
}
