#include <node_api.h>
#include <Windows.h>

napi_value GetPixel(napi_env env, napi_callback_info info)
{
    size_t argc = 2;
    napi_value args[2];
    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);
    if (argc != 2)
    {
        napi_throw_type_error(env, nullptr, "Wrong number of arguments");
        return nullptr;
    }

    napi_valuetype valuetypeX;
    napi_typeof(env, args[0], &valuetypeX);
    if (valuetypeX != napi_number)
    {
        napi_throw_type_error(env, nullptr, "Wrong arguments");
        return nullptr;
    }

    napi_valuetype valuetypeY;
    napi_typeof(env, args[1], &valuetypeY);
    if (valuetypeY != napi_number)
    {
        napi_throw_type_error(env, nullptr, "Wrong arguments");
        return nullptr;
    }

    int x, y;
    napi_get_value_int32(env, args[0], &x);
    napi_get_value_int32(env, args[1], &y);

    napi_value pixel;
    napi_create_int32(env, GetPixel(GetDC(nullptr), x, y), &pixel);

    return pixel;
}

#define DECLARE_NAPI_METHOD(name, func)         \
    {                                           \
        name, 0, func, 0, 0, 0, napi_default, 0 \
    }

napi_value Init(napi_env env, napi_value exports)
{
    napi_property_descriptor addDescriptor = DECLARE_NAPI_METHOD("getPixel", GetPixel);
    napi_define_properties(env, exports, 1, &addDescriptor);
    return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)